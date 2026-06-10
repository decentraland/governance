import ProposalModel from '../entities/Proposal/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType, ProposalWithProject } from '../entities/Proposal/types'

import { DiscourseService } from './DiscourseService'
import { ProposalService } from './ProposalService'

jest.mock('../services/discord', () => ({
  DiscordService: {
    init: jest.fn(),
  },
}))

jest.mock('../services/events', () => ({
  EventsService: {
    projectEnacted: jest.fn(),
  },
}))

jest.mock('../services/notification', () => ({
  NotificationService: {
    projectProposalEnacted: jest.fn(),
  },
}))

jest.mock('../services/update', () => ({
  UpdateService: {
    createPendingUpdatesForVesting: jest.fn(),
  },
}))

jest.mock('./DiscourseService', () => ({
  DiscourseService: {
    commentUpdatedProposal: jest.fn(),
    createProposal: jest.fn(),
  },
}))

describe('ProposalService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('updateProposalStatus', () => {
    it('clears enactment metadata when an enacted proposal is reverted to passed', async () => {
      const user = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
      const passedBy = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
      const proposal: ProposalWithProject = {
        ...createTestProposal(ProposalType.Draft, ProposalStatus.Enacted),
        enacted: true,
        enacted_by: user,
        enacted_description: 'Marked as enacted by mistake',
        enacting_tx: '0x123',
        passed_by: passedBy,
        personnel: [],
      }
      const updateSpy = jest.spyOn(ProposalModel, 'update').mockResolvedValue({} as never)

      const updatedProposal = await ProposalService.updateProposalStatus(
        proposal,
        { status: ProposalStatus.Passed },
        user
      )

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProposalStatus.Passed,
          enacted: false,
          enacted_by: null,
          enacted_description: null,
          enacting_tx: null,
        }),
        { id: proposal.id }
      )
      expect(updateSpy.mock.calls[0][0]).not.toHaveProperty('passed_by')
      expect(updatedProposal).toMatchObject({
        status: ProposalStatus.Passed,
        enacted: false,
        enacted_by: null,
        enacted_description: null,
        enacting_tx: null,
        passed_by: passedBy,
      })
      expect(DiscourseService.commentUpdatedProposal).toHaveBeenCalledWith(updatedProposal)
    })
  })
})
