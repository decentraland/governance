import ProposalModel from '../entities/Proposal/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType, ProposalWithProject } from '../entities/Proposal/types'
import { UpdateService } from '../services/update'

import { DiscourseService } from './DiscourseService'
import { ProjectService } from './ProjectService'
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

jest.mock('./ProjectService', () => ({
  ProjectService: {
    getUpdatedProject: jest.fn(),
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
        // Compare-and-set: the update is conditioned on the status we read, so a concurrent
        // transition cannot be clobbered.
        { id: proposal.id, status: ProposalStatus.Enacted }
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

    describe('when enacting a passed project proposal for the first time', () => {
      const user = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
      const projectId = '11111111-1111-1111-1111-111111111111'
      const vestingAddresses = ['0x1111111111111111111111111111111111111111']
      let proposal: ProposalWithProject

      beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(ProposalModel, 'update').mockResolvedValue({} as never)
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({ status: 'in_progress' } as never)
        proposal = {
          ...createTestProposal(ProposalType.Grant, ProposalStatus.Passed, 10000),
          project_id: projectId,
          personnel: [],
        }
      })

      it('should regenerate the pending vesting updates with the requested addresses', async () => {
        await ProposalService.updateProposalStatus(
          proposal,
          { status: ProposalStatus.Enacted, vesting_addresses: vestingAddresses },
          user
        )

        expect(UpdateService.createPendingUpdatesForVesting).toHaveBeenCalledWith(projectId, vestingAddresses)
      })
    })

    describe('when re-enacting an already-enacted project proposal', () => {
      const user = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
      const projectId = '11111111-1111-1111-1111-111111111111'
      const existingAddresses = ['0x1111111111111111111111111111111111111111']
      let proposal: ProposalWithProject

      beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(ProposalModel, 'update').mockResolvedValue({} as never)
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({ status: 'in_progress' } as never)
        proposal = {
          ...createTestProposal(ProposalType.Grant, ProposalStatus.Enacted, 10000),
          project_id: projectId,
          enacted: true,
          vesting_addresses: existingAddresses,
          personnel: [],
        }
      })

      describe('and the vesting addresses are unchanged', () => {
        it('should not regenerate the pending vesting updates', async () => {
          await ProposalService.updateProposalStatus(
            proposal,
            { status: ProposalStatus.Enacted, vesting_addresses: existingAddresses },
            user
          )

          expect(UpdateService.createPendingUpdatesForVesting).not.toHaveBeenCalled()
        })
      })

      describe('and a new vesting address is added', () => {
        it('should regenerate the pending vesting updates', async () => {
          const newAddresses = [...existingAddresses, '0x2222222222222222222222222222222222222222']

          await ProposalService.updateProposalStatus(
            proposal,
            { status: ProposalStatus.Enacted, vesting_addresses: newAddresses },
            user
          )

          expect(UpdateService.createPendingUpdatesForVesting).toHaveBeenCalledWith(projectId, newAddresses)
        })
      })
    })
  })
})
