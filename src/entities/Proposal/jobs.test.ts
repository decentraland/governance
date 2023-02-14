/* eslint-disable @typescript-eslint/no-empty-function */
import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { NewGrantCategory } from '../Grant/types'
import UpdateModel from '../Updates/model'

import * as calculateOutcome from './calculateOutcome'
import { finishProposal } from './jobs'
import ProposalModel from './model'
import * as routes from './routes'
import {
  ACCEPTED_OUTCOME,
  FINISHED_OUTCOME,
  JOB_CONTEXT_MOCK,
  REJECTED_OUTCOME,
  createTestProposal,
  getTestBudgetWithAvailableSize,
} from './test_helpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'

export const ACCELERATOR_TOTAL = 105000
export const CORE_UNIT_TOTAL = 225225

const GRANT_1_SIZE = 10000
const GRANT_PROPOSAL_1 = createTestProposal(ProposalType.Grant, ProposalStatus.Active, GRANT_1_SIZE)
const GRANT_2_SIZE = 5000
const GRANT_PROPOSAL_2 = createTestProposal(ProposalType.Grant, ProposalStatus.Active, GRANT_2_SIZE)
const GRANT_3_SIZE = 1000
const GRANT_PROPOSAL_3 = createTestProposal(
  ProposalType.Grant,
  ProposalStatus.Active,
  GRANT_3_SIZE,
  NewGrantCategory.CoreUnit
)
const POI_PROPOSAL: ProposalAttributes = createTestProposal(ProposalType.POI, ProposalStatus.Active)

jest.mock('../../constants', () => ({
  DISCORD_SERVICE_ENABLED: false,
}))

describe('finishProposals', () => {
  const updatesSpy = jest.spyOn(UpdateModel, 'createPendingUpdates')
  beforeAll(() => {
    jest.spyOn(ProposalModel, 'finishProposal')
    jest.spyOn(routes, 'commentProposalUpdateInDiscourse').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'init').mockImplementation(() => {})
    updatesSpy.mockResolvedValue([])
    jest.spyOn(DiscordService, 'finishProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newUpdate').mockImplementation(() => {})
  })
  beforeEach(() => {
    updatesSpy.mockClear()
    jest.spyOn(BudgetService, 'getBudgets').mockResolvedValue([getTestBudgetWithAvailableSize()])
    jest.spyOn(BudgetService, 'updateBudgets').mockImplementation(async () => {})
  })
  describe('for a grant proposal with ACTIVE status', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishedProposals').mockResolvedValue([GRANT_PROPOSAL_1])
    })
    describe('when the outcome is REJECTED', () => {
      beforeEach(() => {
        jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(REJECTED_OUTCOME)
      })
      it('finishes the proposal as rejected', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Rejected)
        expect(UpdateModel.createPendingUpdates).toHaveBeenCalledTimes(0)
        expect(DiscordService.finishProposal).toHaveBeenCalledWith(
          GRANT_PROPOSAL_1.id,
          GRANT_PROPOSAL_1.title,
          REJECTED_OUTCOME.outcomeStatus,
          undefined
        )
      })
    })
    describe('when the outcome is ACCEPTED', () => {
      beforeEach(() => {
        jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
      })
      it('finishes the proposal as passed, and creates the pending updates for them', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Passed)
        expect(UpdateModel.createPendingUpdates).toHaveBeenCalledWith(
          GRANT_PROPOSAL_1.id,
          GRANT_PROPOSAL_1.configuration.projectDuration
        )
        expect(DiscordService.finishProposal).toHaveBeenCalledWith(
          GRANT_PROPOSAL_1.id,
          GRANT_PROPOSAL_1.title,
          ACCEPTED_OUTCOME.outcomeStatus,
          undefined
        )
      })

      describe('when the budget is greater than the requested grant size', () => {
        const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE + 1
        beforeEach(() => {
          jest
            .spyOn(BudgetService, 'getBudgets')
            .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
        })
        it('discounts the grant funding size from the corresponding category budget', async () => {
          const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
          EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_1_SIZE
          EXPECTED_BUDGET.categories.accelerator.available -= GRANT_1_SIZE
          EXPECTED_BUDGET.allocated += GRANT_1_SIZE
          await finishProposal(JOB_CONTEXT_MOCK)
          expect(BudgetService.updateBudgets).toHaveBeenCalledWith([EXPECTED_BUDGET])
        })
        it('marks the proposal as PASSED', () => {
          expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Passed)
        })
      })

      describe('when the available budget is equal to the requested grant size', () => {
        const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE
        beforeEach(() => {
          jest
            .spyOn(BudgetService, 'getBudgets')
            .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
        })

        it('discounts the grant size from the corresponding category budget', async () => {
          const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
          EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_1_SIZE
          EXPECTED_BUDGET.categories.accelerator.available -= GRANT_1_SIZE
          EXPECTED_BUDGET.allocated += GRANT_1_SIZE
          await finishProposal(JOB_CONTEXT_MOCK)
          expect(BudgetService.updateBudgets).toHaveBeenCalledWith([EXPECTED_BUDGET])
        })
        it('marks the proposal as PASSED', () => {
          expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Passed)
        })
      })

      describe('when there is not enough budget to fund the grant', () => {
        const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE - 1
        beforeEach(() => {
          jest
            .spyOn(BudgetService, 'getBudgets')
            .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
        })
        it('does not discount the grant funding from the corresponding category budget', async () => {
          await finishProposal(JOB_CONTEXT_MOCK)
          expect(BudgetService.updateBudgets).toHaveBeenCalledWith([
            getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR),
          ])
        })
        it('marks the proposal as OUT OF BUDGET', () => {
          expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.OutOfBudget)
        })
      })
    })

    describe('when the outcome is FINISHED', () => {
      beforeEach(() => {
        jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(FINISHED_OUTCOME)
      })
      it('finishes the proposal as passed, and creates the pending updates for them', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Finished)
        expect(UpdateModel.createPendingUpdates).toHaveBeenCalledTimes(0)
        expect(DiscordService.finishProposal).toHaveBeenCalledWith(
          GRANT_PROPOSAL_1.id,
          GRANT_PROPOSAL_1.title,
          FINISHED_OUTCOME.outcomeStatus,
          FINISHED_OUTCOME.winnerChoice
        )
      })
    })
  })

  describe('for an accepted proposal that is not a grant', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishedProposals').mockResolvedValue([POI_PROPOSAL])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
      jest.spyOn(BudgetService, 'getBudgets').mockResolvedValue([getTestBudgetWithAvailableSize()])
    })
    it('finishes the proposal without affecting the budget', async () => {
      await finishProposal(JOB_CONTEXT_MOCK)
      expect(ProposalModel.finishProposal).toHaveBeenCalledWith([POI_PROPOSAL.id], ProposalStatus.Passed)
      expect(BudgetService.updateBudgets).toHaveBeenCalledWith([getTestBudgetWithAvailableSize()])
    })
  })

  describe('for several grant proposals of the same category', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishedProposals').mockResolvedValue([GRANT_PROPOSAL_1, GRANT_PROPOSAL_2])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
    })

    describe('if there is budget to fund all grants', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE + GRANT_2_SIZE
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgets')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
      })
      it('discounts the budget of the corresponding categories', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith(
          [GRANT_PROPOSAL_1.id, GRANT_PROPOSAL_2.id],
          ProposalStatus.Passed
        )
        expect(BudgetService.updateBudgets).toHaveBeenCalledWith([getTestBudgetWithAvailableSize(0)])
      })
    })

    describe('if there are not enough funds to accept all grants', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE + GRANT_2_SIZE - 1
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgets')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
      })
      it('the latest grants in the list are updated as OUT OF BUDGET', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
        EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_1_SIZE
        EXPECTED_BUDGET.categories.accelerator.available -= GRANT_1_SIZE
        EXPECTED_BUDGET.allocated += GRANT_1_SIZE
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.Passed)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_2.id], ProposalStatus.OutOfBudget)
        expect(BudgetService.updateBudgets).toHaveBeenCalledWith([EXPECTED_BUDGET])
      })
    })

    describe('when there is not enough budget to fund a grant that was created first, but there is remaining budget for a smaller grant', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_2_SIZE + 1
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgets')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)])
      })
      it('marks the first grant as OOB and passes the second grant, discounting only the second grant size from the budget', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        const EXPECTED_BUDGET = getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR)
        EXPECTED_BUDGET.categories.accelerator.allocated += GRANT_2_SIZE
        EXPECTED_BUDGET.categories.accelerator.available -= GRANT_2_SIZE
        EXPECTED_BUDGET.allocated += GRANT_2_SIZE
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.OutOfBudget)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_2.id], ProposalStatus.Passed)
        expect(BudgetService.updateBudgets).toHaveBeenCalledWith([EXPECTED_BUDGET])
      })
    })
  })

  describe('for several grant proposals of different categories', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishedProposals').mockResolvedValue([GRANT_PROPOSAL_1, GRANT_PROPOSAL_3])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
    })

    describe('if there is no budget to fund one category, but there is for another', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE - 1
      const AVAILABLE_FOR_CORE_UNIT = GRANT_3_SIZE
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgets')
          .mockResolvedValue([getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR, AVAILABLE_FOR_CORE_UNIT)])
      })
      it('discounts the budget of the corresponding categories', async () => {
        await finishProposal(JOB_CONTEXT_MOCK)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_3.id], ProposalStatus.Passed)
        expect(ProposalModel.finishProposal).toHaveBeenCalledWith([GRANT_PROPOSAL_1.id], ProposalStatus.OutOfBudget)
        expect(BudgetService.updateBudgets).toHaveBeenCalledWith([
          getTestBudgetWithAvailableSize(AVAILABLE_FOR_ACCELERATOR, 0),
        ])
      })
    })
  })

  // describe('when proposals creation dates correspond to two different budgets', () => {
  //   fail()
  // })
})
