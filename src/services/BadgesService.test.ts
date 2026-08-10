import * as BadgesUtils from '../entities/Badges/utils'
import CoauthorModel from '../entities/Coauthor/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress } from '../entities/Snapshot/utils'
import AirdropJobModel from '../models/AirdropJob'

import { BadgesService } from './BadgesService'
import { ErrorService } from './ErrorService'

jest.mock('../constants', () => ({
  LEGISLATOR_BADGE_SPEC_CID: 'badge-spec-id',
  LAND_OWNER_BADGE_SPEC_CID: 'land-owner-badge-spec-id',
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
