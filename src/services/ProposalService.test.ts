import ProposalModel from '../entities/Proposal/model'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalStatus, ProposalType, ProposalWithProject } from '../entities/Proposal/types'
import UpdateModel from '../entities/Updates/model'
import { UpdateService } from '../services/update'
import { withTransaction } from '../utils/withTransaction'

import { DiscourseService } from './DiscourseService'
import { ProjectService } from './ProjectService'
import { ProposalService } from './ProposalService'
import { EventsService } from './events'
import { NotificationService } from './notification'

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
    computePendingUpdatesForVesting: jest.fn(),
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

jest.mock('../utils/withTransaction', () => ({
  withTransaction: jest.fn(),
}))

// Wire withTransaction to run its callback against a client whose row lock reports `lockedStatus`,
// so tests can drive the win/lose-the-race branches without a database.
function mockTransactionLockedStatus(lockedStatus: ProposalStatus) {
  ;(withTransaction as jest.Mock).mockImplementation((fn) =>
    fn({ query: jest.fn().mockResolvedValue({ rows: [{ status: lockedStatus }], rowCount: 1 }) })
  )
}

describe('ProposalService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('updateProposalStatus', () => {
    const user = '0x2AC89522CB415AC333E64F52a1a5693218cEBD58'
    const projectId = '11111111-1111-1111-1111-111111111111'

    describe('when an enacted proposal is reverted to passed', () => {
      const passedBy = '0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7'
      let proposal: ProposalWithProject
      let updateQuerySpy: jest.SpyInstance
      let updatedProposal: ProposalWithProject

      beforeEach(async () => {
        jest.clearAllMocks()
        proposal = {
          ...createTestProposal(ProposalType.Draft, ProposalStatus.Enacted),
          enacted: true,
          enacted_by: user,
          enacted_description: 'Marked as enacted by mistake',
          enacting_tx: '0x123',
          passed_by: passedBy,
          personnel: [],
        }
        mockTransactionLockedStatus(ProposalStatus.Enacted)
        updateQuerySpy = jest.spyOn(ProposalModel, 'getUpdateQuery')
        updatedProposal = await ProposalService.updateProposalStatus(proposal, { status: ProposalStatus.Passed }, user)
      })

      it('clears the enactment metadata in the update', () => {
        expect(updateQuerySpy).toHaveBeenCalledWith(
          expect.objectContaining({
            status: ProposalStatus.Passed,
            enacted: false,
            enacted_by: null,
            enacted_description: null,
            enacting_tx: null,
          }),
          { id: proposal.id }
        )
      })

      it('does not set passed_by', () => {
        expect(updateQuerySpy.mock.calls[0][0]).not.toHaveProperty('passed_by')
      })

      it('returns the reverted proposal preserving the original passed_by', () => {
        expect(updatedProposal).toMatchObject({
          status: ProposalStatus.Passed,
          enacted: false,
          enacted_by: null,
          enacted_description: null,
          enacting_tx: null,
          passed_by: passedBy,
        })
      })

      it('posts the discourse update', () => {
        expect(DiscourseService.commentUpdatedProposal).toHaveBeenCalledWith(updatedProposal)
      })
    })

    describe('when enacting a passed project proposal for the first time', () => {
      const vestingAddresses = ['0x1111111111111111111111111111111111111111']
      let proposal: ProposalWithProject

      beforeEach(() => {
        jest.clearAllMocks()
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({ status: 'in_progress' } as never)
        ;(UpdateService.computePendingUpdatesForVesting as jest.Mock).mockResolvedValue([])
        mockTransactionLockedStatus(ProposalStatus.Passed)
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

        expect(UpdateService.computePendingUpdatesForVesting).toHaveBeenCalledWith(projectId, vestingAddresses)
      })
    })

    describe('when re-enacting an already-enacted project proposal', () => {
      const existingAddresses = ['0x1111111111111111111111111111111111111111']
      let proposal: ProposalWithProject

      beforeEach(() => {
        jest.clearAllMocks()
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({ status: 'in_progress' } as never)
        ;(UpdateService.computePendingUpdatesForVesting as jest.Mock).mockResolvedValue([])
        mockTransactionLockedStatus(ProposalStatus.Enacted)
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

          expect(UpdateService.computePendingUpdatesForVesting).not.toHaveBeenCalled()
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

          expect(UpdateService.computePendingUpdatesForVesting).toHaveBeenCalledWith(projectId, newAddresses)
        })
      })
    })

    describe('when the row lock reports a different status because a concurrent transition already won', () => {
      const vestingAddresses = ['0x1111111111111111111111111111111111111111']
      let proposal: ProposalWithProject
      let outcome: unknown
      let updateQuerySpy: jest.SpyInstance
      let replaceQuerySpy: jest.SpyInstance

      beforeEach(async () => {
        jest.clearAllMocks()
        ;(ProjectService.getUpdatedProject as jest.Mock).mockResolvedValue({ status: 'in_progress' } as never)
        ;(UpdateService.computePendingUpdatesForVesting as jest.Mock).mockResolvedValue([])
        // We read Passed, but the locked row is already Enacted — the transaction must abort.
        mockTransactionLockedStatus(ProposalStatus.Enacted)
        updateQuerySpy = jest.spyOn(ProposalModel, 'getUpdateQuery')
        replaceQuerySpy = jest.spyOn(UpdateModel, 'getReplacePendingUpdatesQuery')
        proposal = {
          ...createTestProposal(ProposalType.Grant, ProposalStatus.Passed, 10000),
          project_id: projectId,
          personnel: [],
        }
        outcome = await ProposalService.updateProposalStatus(
          proposal,
          { status: ProposalStatus.Enacted, vesting_addresses: vestingAddresses },
          user
        ).catch((error) => error)
      })

      it('should reject instead of returning a success', () => {
        expect(outcome).toBeInstanceOf(Error)
      })

      it('should not write the proposal status', () => {
        expect(updateQuerySpy).not.toHaveBeenCalled()
      })

      it('should not replace the pending vesting updates', () => {
        expect(replaceQuerySpy).not.toHaveBeenCalled()
      })

      it('should not send the enactment notification', () => {
        expect(NotificationService.projectProposalEnacted).not.toHaveBeenCalled()
      })

      it('should not emit the project enacted event', () => {
        expect(EventsService.projectEnacted).not.toHaveBeenCalled()
      })

      it('should not post the discourse update', () => {
        expect(DiscourseService.commentUpdatedProposal).not.toHaveBeenCalled()
      })
    })
  })
})
