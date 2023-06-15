/* eslint-disable @typescript-eslint/no-empty-function */
import { cloneDeep } from 'lodash'

import { BudgetService } from '../../services/BudgetService'
import { DiscordService } from '../../services/DiscordService'
import { DiscourseService } from '../../services/DiscourseService'
import Time from '../../utils/date/Time'
import { BUDGETING_START_DATE } from '../Grant/constants'
import { NewGrantCategory } from '../Grant/types'
import { getQuarterEndDate } from '../QuarterBudget/utils'
import UpdateModel from '../Updates/model'

import { finishProposal, getFinishableTenderProposals } from './jobs'
import ProposalModel from './model'
import * as calculateOutcome from './outcome'
import * as routes from './routes'
import {
  ACCEPTED_OUTCOME,
  FINISHED_OUTCOME,
  GRANT_1_SIZE,
  GRANT_2_SIZE,
  GRANT_3_SIZE,
  GRANT_PROPOSAL_1,
  GRANT_PROPOSAL_2,
  GRANT_PROPOSAL_3,
  JOB_CONTEXT_MOCK,
  POI_PROPOSAL,
  REJECTED_OUTCOME,
  createTestProposal,
  createTestTender,
  getTestBudgetWithAvailableSize,
} from './testHelpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'

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
    jest.spyOn(DiscourseService, 'getCategory').mockImplementation(() => 5)
  })
  beforeEach(() => {
    updatesSpy.mockClear()
    jest.spyOn(BudgetService, 'getBudgetsForProposals').mockResolvedValue([getTestBudgetWithAvailableSize()])
    jest.spyOn(BudgetService, 'updateBudgets').mockImplementation(async () => {})
  })
  describe('for a grant proposal with ACTIVE status', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([GRANT_PROPOSAL_1])
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
            .spyOn(BudgetService, 'getBudgetsForProposals')
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
            .spyOn(BudgetService, 'getBudgetsForProposals')
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
            .spyOn(BudgetService, 'getBudgetsForProposals')
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
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([POI_PROPOSAL])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
      jest.spyOn(BudgetService, 'getBudgetsForProposals').mockResolvedValue([getTestBudgetWithAvailableSize()])
    })
    it('finishes the proposal without affecting the budget', async () => {
      await finishProposal(JOB_CONTEXT_MOCK)
      expect(ProposalModel.finishProposal).toHaveBeenCalledWith([POI_PROPOSAL.id], ProposalStatus.Passed)
      expect(BudgetService.updateBudgets).toHaveBeenCalledWith([getTestBudgetWithAvailableSize()])
    })
  })

  describe('for an accepted proposal that has a start_at date older than the budgeting system start date', () => {
    const OLD_GRANT = cloneDeep(GRANT_PROPOSAL_1)
    OLD_GRANT.start_at = Time.utc(BUDGETING_START_DATE).subtract(1, 'day').toDate()

    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([OLD_GRANT])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
      jest.spyOn(BudgetService, 'getBudgetsForProposals').mockResolvedValue([getTestBudgetWithAvailableSize()])
    })

    it('finishes the proposal', async () => {
      await finishProposal(JOB_CONTEXT_MOCK)
      expect(ProposalModel.finishProposal).toHaveBeenCalledWith([OLD_GRANT.id], ProposalStatus.Passed)
      expect(BudgetService.updateBudgets).toHaveBeenCalledWith([getTestBudgetWithAvailableSize()])
    })
  })

  describe('for several grant proposals of the same category', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([GRANT_PROPOSAL_1, GRANT_PROPOSAL_2])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
    })

    describe('if there is budget to fund all grants', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE + GRANT_2_SIZE
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgetsForProposals')
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
          .spyOn(BudgetService, 'getBudgetsForProposals')
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
          .spyOn(BudgetService, 'getBudgetsForProposals')
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
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([GRANT_PROPOSAL_1, GRANT_PROPOSAL_3])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
    })

    describe('if there is no category budget to fund one grant, but there is for another', () => {
      const AVAILABLE_FOR_ACCELERATOR = GRANT_1_SIZE - 1
      const AVAILABLE_FOR_CORE_UNIT = GRANT_3_SIZE
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getBudgetsForProposals')
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

  describe('when proposals creation dates correspond to two different budgets', () => {
    const DATE_1 = Time.utc('2023-04-01 00:00:00Z').toDate()
    const DATE_2 = Time.utc('2023-07-01 00:00:00Z').toDate()
    const PROPOSAL_OF_DATE_1 = cloneDeep(GRANT_PROPOSAL_1)
    PROPOSAL_OF_DATE_1.start_at = DATE_1
    const PROPOSAL_OF_DATE_2 = cloneDeep(GRANT_PROPOSAL_2)
    PROPOSAL_OF_DATE_2.start_at = DATE_2

    const BUDGET_1 = getTestBudgetWithAvailableSize(GRANT_1_SIZE)
    BUDGET_1.start_at = DATE_1
    BUDGET_1.finish_at = getQuarterEndDate(DATE_1)
    BUDGET_1.id = 'DATE_1_BUDGET'

    const BUDGET_2 = getTestBudgetWithAvailableSize(GRANT_2_SIZE)
    BUDGET_2.start_at = DATE_2
    BUDGET_2.finish_at = getQuarterEndDate(DATE_2)
    BUDGET_2.id = 'DATE_2_BUDGET'

    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishableProposals').mockResolvedValue([PROPOSAL_OF_DATE_1, PROPOSAL_OF_DATE_2])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(ACCEPTED_OUTCOME)
      jest.spyOn(BudgetService, 'getBudgetsForProposals').mockResolvedValue([BUDGET_1, BUDGET_2])
    })

    it('discounts each grant size for the corresponding budget', async () => {
      const EXPECTED_BUDGET_1 = cloneDeep(BUDGET_1)
      EXPECTED_BUDGET_1.categories.accelerator.allocated += GRANT_1_SIZE
      EXPECTED_BUDGET_1.categories.accelerator.available -= GRANT_1_SIZE
      EXPECTED_BUDGET_1.allocated += GRANT_1_SIZE

      const EXPECTED_BUDGET_2 = cloneDeep(BUDGET_2)
      EXPECTED_BUDGET_2.categories.accelerator.allocated += GRANT_2_SIZE
      EXPECTED_BUDGET_2.categories.accelerator.available -= GRANT_2_SIZE
      EXPECTED_BUDGET_2.allocated += GRANT_2_SIZE

      await finishProposal(JOB_CONTEXT_MOCK)

      expect(ProposalModel.finishProposal).toHaveBeenCalledWith(
        [PROPOSAL_OF_DATE_1.id, PROPOSAL_OF_DATE_2.id],
        ProposalStatus.Passed
      )
      expect(BudgetService.updateBudgets).toHaveBeenCalledWith([EXPECTED_BUDGET_1, EXPECTED_BUDGET_2])
    })
  })
})

describe('getFinishableTenderProposals', () => {
  const pendingProposals: ProposalAttributes<any>[] = [
    createTestTender('1', '123'),
    createTestTender('2', '123'),
    createTestTender('3', '123'),
    createTestTender('4', '456'),
    createTestTender('7', '789'),
    createTestProposal(ProposalType.Grant, ProposalStatus.Active, 200, NewGrantCategory.Accelerator),
  ]

  const proposalsList: ProposalAttributes<any>[] = [
    ...pendingProposals,
    createTestTender('5', '456'),
    createTestTender('6', '456'),
    createTestTender('8', '789'),
  ]
  beforeAll(() => {
    // @ts-ignore
    jest.spyOn(ProposalModel, 'getProposalList').mockImplementation((filter: any) => {
      return proposalsList.filter((p) => {
        return p.configuration.linked_proposal_id === filter.linkedProposalId && p.type === ProposalType.Tender
      })
    })
  })

  it('does not return duplicate proposals', async () => {
    const finishableTenderProposals = await getFinishableTenderProposals(pendingProposals)
    expect(finishableTenderProposals.length).toEqual(8)
  })
})
