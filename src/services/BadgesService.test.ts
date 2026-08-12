import { OtterspaceSubgraph } from '../clients/OtterspaceSubgraph'
import { ActionStatus, ErrorReason, RevokeOrReinstateResult } from '../entities/Badges/types'
import * as BadgesUtils from '../entities/Badges/utils'
import CoauthorModel from '../entities/Coauthor/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress } from '../entities/Snapshot/utils'
import AirdropJobModel from '../models/AirdropJob'
import * as contractInteractions from '../utils/contractInteractions'

import { BadgesService } from './BadgesService'
import { ErrorService } from './ErrorService'

jest.mock('../constants', () => ({
  LEGISLATOR_BADGE_SPEC_CID: 'badge-spec-id',
  LAND_OWNER_BADGE_SPEC_CID: 'land-owner-badge-spec-id',
  TRIMMED_OTTERSPACE_RAFT_ID: 'raft-id',
  // The real implementation: an id is usable only when it is a two-part `spec:token` string.
  trimOtterspaceId: (rawId: string) => {
    const parts = rawId.split(':')
    return parts.length === 2 ? parts[1] : ''
  },
}))

jest.mock('../utils/contractInteractions', () => ({
  getBadgesSignerAndContract: jest.fn(),
  estimateGas: jest.fn(),
  airdropWithRetry: jest.fn(),
  createSpecWithRetry: jest.fn(),
  reinstateBadge: jest.fn(),
  revokeBadge: jest.fn(),
}))

const COAUTHORS = ['0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7', '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f']
const CURRENT_OWNER = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
describe('giveLegislatorBadges', () => {
  it('should call queueAirdropJob with correct arguments for governance proposals', async () => {
    jest.spyOn(AirdropJobModel, 'create').mockResolvedValue(async () => {})
    jest.spyOn(CoauthorModel, 'findAllByProposals').mockResolvedValue(COAUTHORS)
    jest.spyOn(BadgesUtils, 'getClassifiedUsersForBadge').mockImplementation((badgeCid: string, users: string[]) => {
      return Promise.resolve({
        listedUsersWithoutBadge: users,
        listedUsersWithMintedOrReinstatedBadge: [],
        listedUsersWithRevokedBadge: [],
        listedUsersWithBurnedBadge: [],
        unlistedUsersWithMintedOrReinstatedBadge: [],
        unlistedUsersWithRevokedOrBurnedBadge: [],
      })
    })
    const proposal = createTestProposal(ProposalType.Governance, ProposalStatus.Passed)
    const expectedAuthorsAndCoauthors = [proposal.user, ...COAUTHORS].map(getChecksumAddress)
    await BadgesService.giveLegislatorBadges([proposal])
    expect(AirdropJobModel.create).toHaveBeenCalledWith({
      id: expect.any(String),
      badge_spec: 'badge-spec-id',
      recipients: expectedAuthorsAndCoauthors,
    })
  })

  it('does not try to airdrop any badge when there are no governance proposals', async () => {
    jest.clearAllMocks()
    const proposal = createTestProposal(ProposalType.Draft, ProposalStatus.Passed)
    await BadgesService.giveLegislatorBadges([proposal])
    expect(AirdropJobModel.create).not.toHaveBeenCalled()
  })
})

describe('giveAndRevokeLandOwnerBadges', () => {
  let getLandOwnerAddresses: jest.SpyInstance
  let getEligibleUsersForBadge: jest.SpyInstance
  let revokeBadges: jest.SpyInstance

  beforeEach(() => {
    jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
    getEligibleUsersForBadge = jest.spyOn(BadgesUtils, 'getEligibleUsersForBadge')
    revokeBadges = jest.spyOn(BadgesService, 'revokeBadges').mockResolvedValue([])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // The badge to revoke is derived from absence from the owner list, so an unreadable list is
  // indistinguishable from "nobody owns land" and would revoke every current holder on-chain.
  describe('when the land owners cannot be read', () => {
    beforeEach(async () => {
      getLandOwnerAddresses = jest
        .spyOn(BadgesUtils, 'getLandOwnerAddresses')
        .mockRejectedValue(new BadgesUtils.LandOwnersUnavailableError(new Error('network down')))
      await BadgesService.giveAndRevokeLandOwnerBadges()
    })

    it('should not revoke any badge', () => {
      expect(revokeBadges).not.toHaveBeenCalled()
    })

    it('should not classify holders against an empty owner list', () => {
      expect(getEligibleUsersForBadge).not.toHaveBeenCalled()
    })

    it('should report the skipped run', () => {
      expect(ErrorService.report).toHaveBeenCalledWith(
        'Skipping the LandOwner badge run: the land owners could not be read',
        expect.objectContaining({ error: expect.stringContaining('LandOwnersUnavailableError') })
      )
    })
  })

  describe('and the land owners are read and a holder no longer owns land', () => {
    const FORMER_OWNER = '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f'

    beforeEach(async () => {
      getLandOwnerAddresses = jest.spyOn(BadgesUtils, 'getLandOwnerAddresses').mockResolvedValue([CURRENT_OWNER])
      getEligibleUsersForBadge.mockResolvedValue({
        eligibleUsersForBadge: [],
        usersWithBadgesToReinstate: [],
        usersWithBadgesToRevoke: [FORMER_OWNER],
      })
      await BadgesService.giveAndRevokeLandOwnerBadges()
    })

    it('should still revoke that holder, so failing closed did not disable the job', () => {
      expect(revokeBadges).toHaveBeenCalledWith('land-owner-badge-spec-id', [FORMER_OWNER])
    })

    it('should classify holders against the owner list it read', () => {
      expect(getLandOwnerAddresses).toHaveBeenCalled()
    })
  })
})

// Gas is estimated once for the whole batch. Estimating against an unusable id throws before the loop
// records anything, so a single bad id at the front used to fail every revocation in the batch.
describe.each([
  ['revokeBadges' as const, 'revokeBadge' as const],
  ['reinstateBadges' as const, 'reinstateBadge' as const],
])('BadgesService.%s', (method, contractMethod) => {
  const ADDRESS = '0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7'
  const OTHER_ADDRESS = '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f'

  let getRecipientsBadgeIds: jest.Mock
  let estimateGasSpy: jest.Mock
  let contractCall: jest.Mock

  beforeEach(() => {
    contractCall = jest.fn().mockResolvedValue({ hash: '0xhash', wait: jest.fn().mockResolvedValue({}) })
    estimateGasSpy = contractInteractions.estimateGas as jest.Mock
    estimateGasSpy.mockResolvedValue({})
    ;(contractInteractions.getBadgesSignerAndContract as jest.Mock).mockReturnValue({
      signer: {},
      contract: {
        estimateGas: { [contractMethod]: jest.fn().mockResolvedValue({}) },
        connect: () => ({ [contractMethod]: contractCall }),
      },
    })
    getRecipientsBadgeIds = jest.fn()
    jest.spyOn(OtterspaceSubgraph, 'get').mockReturnValue({ getRecipientsBadgeIds } as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('when every returned badge id is unusable', () => {
    let results: RevokeOrReinstateResult[]

    beforeEach(async () => {
      getRecipientsBadgeIds.mockResolvedValue([
        { id: 'malformed', address: ADDRESS },
        { id: 'also-malformed', address: OTHER_ADDRESS },
      ])
      results = await BadgesService[method]('badge-cid', [ADDRESS, OTHER_ADDRESS])
    })

    it('should not estimate gas against an unusable id', () => {
      expect(estimateGasSpy).not.toHaveBeenCalled()
    })

    it('should not submit any transaction', () => {
      expect(contractCall).not.toHaveBeenCalled()
    })

    it('should report the invalid id for every recipient', () => {
      expect(results).toEqual([
        { status: ActionStatus.Failed, address: ADDRESS, badgeId: 'malformed', error: ErrorReason.InvalidBadgeId },
        {
          status: ActionStatus.Failed,
          address: OTHER_ADDRESS,
          badgeId: 'also-malformed',
          error: ErrorReason.InvalidBadgeId,
        },
      ])
    })
  })

  // The batch used to be estimated against whichever id came first, so a leading bad id took the
  // whole batch down with it.
  describe('and only the first badge id is unusable', () => {
    let results: RevokeOrReinstateResult[]

    beforeEach(async () => {
      getRecipientsBadgeIds.mockResolvedValue([
        { id: 'malformed', address: ADDRESS },
        { id: 'spec:token', address: OTHER_ADDRESS },
      ])
      results = await BadgesService[method]('badge-cid', [ADDRESS, OTHER_ADDRESS])
    })

    it('should estimate gas against the first usable id', () => {
      expect(estimateGasSpy).toHaveBeenCalled()
    })

    it('should still act on the recipient whose id is usable', () => {
      expect(results).toContainEqual({ status: ActionStatus.Success, address: OTHER_ADDRESS, badgeId: 'token' })
    })

    it('should report the invalid id for the other recipient', () => {
      expect(results).toContainEqual({
        status: ActionStatus.Failed,
        address: ADDRESS,
        badgeId: 'malformed',
        error: ErrorReason.InvalidBadgeId,
      })
    })
  })
})
