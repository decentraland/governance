import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { cloneDeep } from 'lodash'

import { DclData } from '../clients/DclData'
import { CategoryBudget, NULL_BUDGET } from '../entities/Budget/types'
import { BUDGETING_START_DATE } from '../entities/Grant/constants'
import { NewGrantCategory } from '../entities/Grant/types'
import ProposalModel from '../entities/Proposal/model'
import { CURRENT_TEST_BUDGET, GRANT_PROPOSAL_1, GRANT_PROPOSAL_2 } from '../entities/Proposal/testHelpers'
import { ProposalType } from '../entities/Proposal/types'
import QuarterBudgetModel from '../entities/QuarterBudget/model'
import { QuarterCategoryBudgetAttributes } from '../entities/QuarterCategoryBudget/types'
import { getUncappedRoundedPercentage } from '../helpers'
import Time from '../utils/date/Time'

import { BudgetService } from './BudgetService'

const NOW = new Date('2023-02-03T00:00:00Z')

export const VALID_TRANSPARENCY_BUDGET_1 = {
  category_percentages: {
    accelerator: 7,
    core_unit: 15,
    documentation: 3,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-01-01T00:00:00Z',
  total: 1501500,
}

export const VALID_TRANSPARENCY_BUDGET_2 = {
  category_percentages: {
    accelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-04-01T00:00:00Z',
  total: 2000000,
}

export const VALID_TRANSPARENCY_BUDGET_3 = {
  category_percentages: {
    accelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-07-01T00:00:00Z',
  total: 1501500,
}

export const INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET = {
  category_percentages: {
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-07-01T00:00:00Z',
  total: 1501500,
}

export const INVALID_CATEGORIES_NAME_TRANSPARENCY_BUDGET = {
  category_percentages: {
    acelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-07-01T00:00:00Z',
  total: 1501500,
}

export const OVERLAPPING_TRANSPARENCY_BUDGET = {
  category_percentages: {
    accelerator: 10,
    core_unit: 10,
    documentation: 5,
    in_world_content: 20,
    platform: 40,
    social_media_content: 5,
    sponsorship: 10,
  },
  start_date: '2023-02-01T00:00:00Z',
  total: 1501500,
}

function asserErrorLogging() {
  it('logs the error', async () => {
    const logError = jest.spyOn(logger, 'error')
    await BudgetService.getTransparencyBudgets()
    expect(logError).toHaveBeenCalled()
  })
}

jest.mock('../constants', () => ({
  DISCORD_SERVICE_ENABLED: false,
  NOTIFICATIONS_SERVICE_ENABLED: false,
}))

describe('BudgetService', () => {
  describe('getTransparencyBudgets', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(logger, 'error').mockImplementation(() => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'error').mockImplementation(() => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(console, 'log').mockImplementation(() => {})
    })
    describe('when it receives a list of valid budgets', () => {
      jest
        .spyOn(DclData.get(), 'getBudgets')
        .mockResolvedValue([VALID_TRANSPARENCY_BUDGET_1, VALID_TRANSPARENCY_BUDGET_2])
      it('returns a list of parsed budgets', async () => {
        expect(await BudgetService.getTransparencyBudgets()).toEqual([
          VALID_TRANSPARENCY_BUDGET_1,
          VALID_TRANSPARENCY_BUDGET_2,
        ])
      })
      afterAll(() => jest.clearAllMocks())
    })

    describe('when it receives a list with no valid budgets', () => {
      beforeAll(() =>
        jest
          .spyOn(DclData.get(), 'getBudgets')
          .mockImplementation(async () => [INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET])
      )

      asserErrorLogging()

      it('returns an empty list', async () => {
        expect(await BudgetService.getTransparencyBudgets()).toEqual([])
      })

      afterAll(() => jest.clearAllMocks())
    })

    describe('when it receives an empty list of budgets', () => {
      beforeAll(() => jest.spyOn(DclData.get(), 'getBudgets').mockResolvedValue([]))

      asserErrorLogging()

      it('returns an empty list', async () => {
        expect(await BudgetService.getTransparencyBudgets()).toEqual([])
      })

      afterAll(() => jest.clearAllMocks())
    })

    describe('when it receives a list with valid and invalid budgets', () => {
      beforeAll(() =>
        jest
          .spyOn(DclData.get(), 'getBudgets')
          .mockResolvedValue([VALID_TRANSPARENCY_BUDGET_1, INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET])
      )

      asserErrorLogging()

      it('returns an empty list', async () => {
        expect(await BudgetService.getTransparencyBudgets()).toEqual([])
      })

      afterAll(() => jest.clearAllMocks())
    })
  })

  describe('getCategoryBudget', () => {
    it('returns the total, allocated, and available amounts for the current category budget ', async () => {
      const categoryBudget: QuarterCategoryBudgetAttributes = {
        quarter_budget_id: '1',
        category: NewGrantCategory.Accelerator,
        total: 10,
        allocated: 8,
        created_at: NOW,
        updated_at: NOW,
      }
      jest.spyOn(QuarterBudgetModel, 'getCategoryBudgetForCurrentQuarter').mockResolvedValue(categoryBudget)

      expect(await BudgetService.getCategoryBudget(NewGrantCategory.Accelerator)).toEqual({
        total: 10,
        allocated: 8,
        available: 2,
      })
    })

    describe('when the allocated amount is bigger than the total', () => {
      beforeEach(() => {
        const categoryBudget: QuarterCategoryBudgetAttributes = {
          quarter_budget_id: '1',
          category: NewGrantCategory.Accelerator,
          total: 10,
          allocated: 12,
          created_at: NOW,
          updated_at: NOW,
        }
        jest.spyOn(QuarterBudgetModel, 'getCategoryBudgetForCurrentQuarter').mockResolvedValue(categoryBudget)
      })

      it('returns a current category budget with a negative available amount', async () => {
        expect(await BudgetService.getCategoryBudget(NewGrantCategory.Accelerator)).toEqual({
          total: 10,
          allocated: 12,
          available: -2,
        })
      })
    })
  })

  describe('validateGrantRequest', () => {
    const TOTAL_BUDGET = 1000
    const grantCategory = NewGrantCategory.InWorldContent
    afterEach(() => jest.clearAllMocks())

    describe('when there is a positive amount of available budget', () => {
      const AVAILABLE_BUDGET = 200
      beforeEach(() => {
        const currentCategoryBudget: CategoryBudget = {
          total: TOTAL_BUDGET,
          allocated: TOTAL_BUDGET - AVAILABLE_BUDGET,
          available: AVAILABLE_BUDGET,
        }
        jest.spyOn(BudgetService, 'getCategoryBudget').mockResolvedValue(currentCategoryBudget)
      })

      it('fails when the requested amount is bigger than the available budget', async () => {
        const requestedGrantSize = AVAILABLE_BUDGET + 1
        await expect(() => BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).rejects.toThrowError(
          `Not enough budget for requested grant size. Available: $${AVAILABLE_BUDGET}. Requested: $${requestedGrantSize}`
        )
      })

      it('allows for requests equal to the total available budget for a category', () => {
        const requestedGrantSize = AVAILABLE_BUDGET
        expect(async () => await BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).not.toThrow()
      })

      it('allows for requests below the available budget for a category', () => {
        const requestedGrantSize = AVAILABLE_BUDGET - 1
        expect(async () => await BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).not.toThrow()
      })
    })

    describe('when allocated budget exceeds available budget', () => {
      const AVAILABLE_BUDGET = -200
      beforeEach(() => {
        const currentCategoryBudget: CategoryBudget = {
          total: 1000,
          allocated: 1200,
          available: AVAILABLE_BUDGET,
        }
        jest.spyOn(BudgetService, 'getCategoryBudget').mockResolvedValue(currentCategoryBudget)
      })

      it('fails for any requested grant size', async () => {
        const requestedGrantSize = 400
        await expect(() => BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).rejects.toThrow(
          `Not enough budget for requested grant size. Available: $${AVAILABLE_BUDGET}. Requested: $${requestedGrantSize}`
        )
      })
    })
  })

  describe('getProposalsMinAndMaxDates', () => {
    const MIN_DATE = Time.utc('2023-01-01 00:00:00Z').toDate()
    const MIDDLE_DATE = Time.utc('2023-03-01 00:00:00Z').toDate()
    const MAX_DATE = Time.utc('2023-05-02 00:00:00Z').toDate()

    describe('given a list of proposals with different start dates', () => {
      it('returns the min and max start dates', () => {
        const PROPOSALS = [{ start_at: MIDDLE_DATE }, { start_at: MIN_DATE }, { start_at: MAX_DATE }]
        expect(BudgetService.getProposalsBudgetingMinAndMaxDates(PROPOSALS)).toEqual({
          minDate: MIN_DATE,
          maxDate: MAX_DATE,
        })
      })
    })

    describe('given a list of proposals with same start dates', () => {
      it('returns the same min and max start dates', () => {
        const PROPOSALS = [{ start_at: MIN_DATE }, { start_at: MIN_DATE }, { start_at: MIN_DATE }]
        expect(BudgetService.getProposalsBudgetingMinAndMaxDates(PROPOSALS)).toEqual({
          minDate: MIN_DATE,
          maxDate: MIN_DATE,
        })
      })
    })

    describe('when there is a proposal older than the budgeting system implementation', () => {
      it('filters the proposal from the chosen dates', () => {
        const PROPOSALS = [
          { start_at: Time.utc(BUDGETING_START_DATE).subtract(1, 'day').toDate() },
          { start_at: MAX_DATE },
          { start_at: MIN_DATE },
        ]
        expect(BudgetService.getProposalsBudgetingMinAndMaxDates(PROPOSALS)).toEqual({
          minDate: MIN_DATE,
          maxDate: MAX_DATE,
        })
      })
    })
  })

  describe('getBudgets', () => {
    const QUARTER_1_DATE = Time.utc('2023-01-01 00:00:00Z').toDate()
    const QUARTER_2_DATE = Time.utc('2023-05-02 00:00:00Z').toDate()

    describe('if there are no proposals with starting dates after the budgeting system implementation', () => {
      const PROPOSALS = [
        { start_at: Time.utc(BUDGETING_START_DATE).subtract(1, 'day').toDate(), type: ProposalType.Grant },
      ]
      beforeEach(() => {
        jest
          .spyOn(BudgetService, 'getProposalsBudgetingMinAndMaxDates')
          .mockReturnValueOnce({ minDate: undefined, maxDate: undefined })
      })
      it('returns an empty budgets list', async () => {
        expect(await BudgetService.getBudgetsForProposals(PROPOSALS)).toEqual([])
      })
    })

    describe('if proposals min and max dates are the same', () => {
      const PROPOSALS = [
        { start_at: QUARTER_1_DATE, type: ProposalType.Grant },
        { start_at: QUARTER_1_DATE, type: ProposalType.Grant },
      ]
      const BUDGET_1 = cloneDeep(NULL_BUDGET)
      it('returns only one budget', async () => {
        jest.spyOn(QuarterBudgetModel, 'getBudgetForDate').mockResolvedValueOnce(BUDGET_1)
        expect(await BudgetService.getBudgetsForProposals(PROPOSALS)).toEqual([BUDGET_1])
      })
    })

    describe('if proposals min and max dates are different but are for the same budget', () => {
      const PROPOSALS = [
        { start_at: QUARTER_1_DATE, type: ProposalType.Grant },
        { start_at: Time.utc(QUARTER_1_DATE).add(1, 'day').toDate(), type: ProposalType.Grant },
      ]
      const BUDGET_1 = cloneDeep(NULL_BUDGET)
      BUDGET_1.id = 'budget_1'
      beforeEach(() => {
        jest.spyOn(QuarterBudgetModel, 'getBudgetForDate').mockResolvedValue(BUDGET_1)
      })

      it('returns only one budget', async () => {
        expect(await BudgetService.getBudgetsForProposals(PROPOSALS)).toEqual([BUDGET_1])
      })
    })

    describe('if proposals min and max dates are for different budgets', () => {
      const PROPOSALS = [
        { start_at: QUARTER_1_DATE, type: ProposalType.Grant },
        { start_at: QUARTER_2_DATE, type: ProposalType.Grant },
      ]
      const BUDGET_1 = cloneDeep(NULL_BUDGET)
      BUDGET_1.id = 'budget_1'
      const BUDGET_2 = cloneDeep(NULL_BUDGET)
      BUDGET_2.id = 'budget_2'

      beforeEach(() => {
        jest
          .spyOn(QuarterBudgetModel, 'getBudgetForDate')
          .mockResolvedValueOnce(BUDGET_1)
          .mockResolvedValueOnce(BUDGET_2)
      })

      it('returns only one budget', async () => {
        expect(await BudgetService.getBudgetsForProposals(PROPOSALS)).toEqual([BUDGET_1, BUDGET_2])
      })
    })
  })

  describe('getExpectedAllocatedBudget', () => {
    describe('when the contested budget is below the available budget', () => {
      beforeEach(() => {
        jest.spyOn(ProposalModel, 'getActiveGrantProposals').mockResolvedValueOnce([GRANT_PROPOSAL_1, GRANT_PROPOSAL_2])
        jest.spyOn(BudgetService, 'getCurrentBudget').mockResolvedValueOnce(CURRENT_TEST_BUDGET)
      })

      it('returns the expected allocated budget', async () => {
        const proposal2Size = GRANT_PROPOSAL_2.configuration.size
        const proposal1Size = GRANT_PROPOSAL_1.configuration.size
        const totalContested = proposal1Size + proposal2Size
        const availableForAccelerator =
          CURRENT_TEST_BUDGET.categories.accelerator.total - CURRENT_TEST_BUDGET.categories.accelerator.allocated

        const expectedAllocatedBudget = await BudgetService.getCurrentContestedBudget()
        expect(expectedAllocatedBudget.total).toEqual(CURRENT_TEST_BUDGET.total)
        expect(expectedAllocatedBudget.total_contested).toEqual(totalContested)
        expect(expectedAllocatedBudget.categories.accelerator).toEqual({
          total: CURRENT_TEST_BUDGET.categories.accelerator.total,
          allocated: CURRENT_TEST_BUDGET.categories.accelerator.allocated,
          available: availableForAccelerator,
          contested: totalContested,
          contested_over_available_percentage: getUncappedRoundedPercentage(totalContested, availableForAccelerator),
          contestants: [
            {
              ...GRANT_PROPOSAL_1,
              size: proposal1Size,
              contested_percentage: getUncappedRoundedPercentage(proposal1Size, totalContested),
            },
            {
              ...GRANT_PROPOSAL_2,
              size: proposal2Size,
              contested_percentage: getUncappedRoundedPercentage(proposal2Size, totalContested),
            },
          ],
        })

        expect(expectedAllocatedBudget.categories.core_unit).toEqual({
          total: CURRENT_TEST_BUDGET.categories.core_unit.total,
          allocated: CURRENT_TEST_BUDGET.categories.core_unit.allocated,
          available: 173250,
          contested: 0,
          contested_over_available_percentage: 0,
          contestants: [],
        })
      })
    })

    describe('when the contested budget is above the available budget', () => {
      const GRANT_PROPOSAL_ABOVE_BUDGET = cloneDeep(GRANT_PROPOSAL_1)
      GRANT_PROPOSAL_ABOVE_BUDGET.configuration.size = CURRENT_TEST_BUDGET.categories.accelerator.total * 2

      beforeEach(() => {
        jest
          .spyOn(ProposalModel, 'getActiveGrantProposals')
          .mockResolvedValueOnce([GRANT_PROPOSAL_ABOVE_BUDGET, GRANT_PROPOSAL_2])
        jest.spyOn(BudgetService, 'getCurrentBudget').mockResolvedValueOnce(CURRENT_TEST_BUDGET)
      })

      it('returns the expected allocated budget with a contested over available percentage over 100', async () => {
        const proposal2Size = GRANT_PROPOSAL_2.configuration.size
        const proposal1Size = GRANT_PROPOSAL_ABOVE_BUDGET.configuration.size
        const totalContested = proposal1Size + proposal2Size
        const availableForAccelerator =
          CURRENT_TEST_BUDGET.categories.accelerator.total - CURRENT_TEST_BUDGET.categories.accelerator.allocated

        const expectedAllocatedBudget = await BudgetService.getCurrentContestedBudget()
        expect(expectedAllocatedBudget.total).toEqual(CURRENT_TEST_BUDGET.total)
        expect(expectedAllocatedBudget.total_contested).toEqual(totalContested)
        expect(expectedAllocatedBudget.categories.accelerator).toEqual({
          total: CURRENT_TEST_BUDGET.categories.accelerator.total,
          allocated: CURRENT_TEST_BUDGET.categories.accelerator.allocated,
          available: availableForAccelerator,
          contested: totalContested,
          contested_over_available_percentage: 206,
          contestants: [
            {
              ...GRANT_PROPOSAL_ABOVE_BUDGET,
              size: proposal1Size,
              contested_percentage: getUncappedRoundedPercentage(proposal1Size, totalContested),
            },
            {
              ...GRANT_PROPOSAL_2,
              size: proposal2Size,
              contested_percentage: getUncappedRoundedPercentage(proposal2Size, totalContested),
            },
          ],
        })
      })
    })
  })
})
