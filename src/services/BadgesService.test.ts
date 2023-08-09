import AirdropJobModel from '../back/models/AirdropJob'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'

import { BadgesService } from './BadgesService'

jest.mock('../constants', () => ({
  LEGISLATOR_BADGE_SPEC_CID: 'badge-spec-id',
}))

describe('giveLegislatorBadges', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(AirdropJobModel, 'create').mockResolvedValue(async () => {})
  })

  it('should call queueAirdropJob with correct arguments for governance proposals', async () => {
    const proposal = createTestProposal(ProposalType.Governance, ProposalStatus.Passed)
    proposal.user = 'user_address'
    proposal.configuration.coAuthors = ['coauthor1', 'coauthor2']
    await BadgesService.giveLegislatorBadges([proposal])

    const expectedAuthorsAndCoauthors = ['user_address', 'coauthor1', 'coauthor2']
    expect(AirdropJobModel.create).toHaveBeenCalledWith({
      badge_spec: 'badge-spec-id',
      recipients: expectedAuthorsAndCoauthors,
      id: expect.any(String),
    })
  })
})
