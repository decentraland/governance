import AirdropJobModel from '../back/models/AirdropJob'
import CoauthorModel from '../entities/Coauthor/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { getChecksumAddress } from '../entities/Snapshot/utils'

import { BadgesService } from './BadgesService'

jest.mock('../constants', () => ({
  LEGISLATOR_BADGE_SPEC_CID: 'badge-spec-id',
}))

const COAUTHORS = ['0x56d0b5ed3d525332f00c9bc938f93598ab16aaa7', '0x49e4dbff86a2e5da27c540c9a9e8d2c3726e278f']
describe('giveLegislatorBadges', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(AirdropJobModel, 'create').mockResolvedValue(async () => {})
    jest.spyOn(CoauthorModel, 'findAllByProposals').mockResolvedValue(COAUTHORS)
  })

  it('should call queueAirdropJob with correct arguments for governance proposals', async () => {
    const proposal = createTestProposal(ProposalType.Governance, ProposalStatus.Passed)
    proposal.user = '0x4757ce43dc5429b8f1a132dc29ef970e55ae722b'
    const expectedAuthorsAndCoauthors = [proposal.user, ...COAUTHORS].map(getChecksumAddress)
    await BadgesService.giveLegislatorBadges([proposal])
    expect(AirdropJobModel.create).toHaveBeenCalledWith({
      id: expect.any(String),
      badge_spec: 'badge-spec-id',
      recipients: expectedAuthorsAndCoauthors,
    })
  })
})
