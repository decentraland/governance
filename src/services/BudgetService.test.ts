import logger from 'decentraland-gatsby/dist/entities/Development/logger'

import { DclData } from '../clients/DclData'
import { NewGrantCategory } from '../entities/Grant/types'
import QuarterBudgetModel from '../entities/QuarterBudget/model'
import { QuarterCategoryBudgetAttributes } from '../entities/QuarterCategoryBudget/types'

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

describe('BudgetService', () => {
  describe('getTransparencyBudgets', () => {
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
  //
  //   describe('validateGrantRequest', () => {
  //     const TOTAL_BUDGET = 1000
  //     const grantCategory = NewGrantCategory.InWorldContent
  //     afterEach(() => jest.clearAllMocks())
  //
  //     describe('when there is a positive amount of available budget', () => {
  //       const AVAILABLE_BUDGET = 200
  //       beforeEach(() => {
  //         const currentCategoryBudget: CurrentCategoryBudget = {
  //           total: TOTAL_BUDGET,
  //           allocated: TOTAL_BUDGET - AVAILABLE_BUDGET,
  //           available: AVAILABLE_BUDGET,
  //         }
  //         jest.spyOn(BudgetService, 'getCategoryBudget').mockResolvedValue(currentCategoryBudget)
  //       })
  //
  //       // TODO: test for grant size menor a 100
  //       it('fails when the requested amount is bigger than the available budget', async () => {
  //         const requestedGrantSize = AVAILABLE_BUDGET + 1
  //         expect(async () => await BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).toThrow(
  //           `Not enough budget for requested grant size. Available: $${AVAILABLE_BUDGET}. Requested: $${requestedGrantSize}`
  //         )
  //       })
  //
  //       it('allows for requests equal to the total available budget for a category', () => {
  //         const requestedGrantSize = AVAILABLE_BUDGET
  //         expect(async () => await BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).not.toThrow()
  //       })
  //
  //       it('allows for requests below the available budget for a category', () => {
  //         const requestedGrantSize = AVAILABLE_BUDGET - 1
  //         expect(async () => await BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).not.toThrow()
  //       })
  //     })
  //
  //     describe('when allocated budget exceeds available budget', () => {
  //       const AVAILABLE_BUDGET = -200
  //       beforeEach(() => {
  //         const currentCategoryBudget: CurrentCategoryBudget = {
  //           total: 1000,
  //           allocated: 1200,
  //           available: AVAILABLE_BUDGET,
  //         }
  //         jest.spyOn(BudgetService, 'getCategoryBudget').mockResolvedValue(currentCategoryBudget)
  //       })
  //
  //       it('fails for any requested grant size', async () => {
  //         const requestedGrantSize = 400
  //         expect(async () => await BudgetService.validateGrantRequest(requestedGrantSize, grantCategory)).toThrow(
  //           `Not enough budget for requested grant size. Available: $${AVAILABLE_BUDGET}. Requested: $${requestedGrantSize}`
  //         )
  //       })
  //     })
  //   })
})
