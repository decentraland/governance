import {
  INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET,
  INVALID_CATEGORIES_NAME_TRANSPARENCY_BUDGET,
  OVERLAPPING_TRANSPARENCY_BUDGET,
  VALID_TRANSPARENCY_BUDGET_1,
  VALID_TRANSPARENCY_BUDGET_2,
} from '../../services/BudgetService.test'
import QuarterCategoryBudgetModel from '../QuarterCategoryBudget/model'

import QuarterBudgetModel from './model'
import { getQuarterEndDate, getQuarterStartDate } from './utils'

const NOW = new Date('2023-01-01')
const VALID_QUARTER_BUDGET_1 = {
  id: '1',
  start_at: getQuarterStartDate(VALID_TRANSPARENCY_BUDGET_1.start_date),
  finish_at: getQuarterEndDate(getQuarterStartDate(VALID_TRANSPARENCY_BUDGET_1.start_date)),
  total: VALID_TRANSPARENCY_BUDGET_1.total,
  created_at: NOW,
  updated_at: NOW,
}

const VALID_QUARTER_BUDGET_2 = {
  id: '1',
  start_at: getQuarterStartDate(VALID_TRANSPARENCY_BUDGET_2.start_date),
  finish_at: getQuarterEndDate(getQuarterStartDate(VALID_TRANSPARENCY_BUDGET_2.start_date)),
  total: VALID_TRANSPARENCY_BUDGET_2.total,
  created_at: NOW,
  updated_at: NOW,
}

describe('QuarterBudgetModel', () => {
  describe('createNewBudgets', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.spyOn(QuarterBudgetModel, 'delete')
      jest.spyOn(QuarterCategoryBudgetModel, 'create').mockResolvedValue({})
    })

    describe('when there are no existing budgets', () => {
      beforeEach(() => {
        jest.spyOn(QuarterBudgetModel, 'find').mockResolvedValue([])
        jest.spyOn(QuarterBudgetModel, 'create').mockResolvedValue(VALID_QUARTER_BUDGET_1)
      })

      describe('when it receives a new budget', () => {
        it('creates a new budget', async () => {
          await QuarterBudgetModel.createNewBudgets([VALID_TRANSPARENCY_BUDGET_1])
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(0)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(7)
        })
      })

      describe('when it receives several new budgets', () => {
        const NEW_TRANSPARENCY_BUDGETS = [VALID_TRANSPARENCY_BUDGET_1, VALID_TRANSPARENCY_BUDGET_2]
        it('creates new budgets', async () => {
          await QuarterBudgetModel.createNewBudgets(NEW_TRANSPARENCY_BUDGETS)
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(2)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(0)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(14)
        })
      })

      describe('when receiving a list with two budgets that have the same start day', () => {
        const NEW_TRANSPARENCY_BUDGETS = [VALID_TRANSPARENCY_BUDGET_1, VALID_TRANSPARENCY_BUDGET_1]

        it('only one is created', async () => {
          await QuarterBudgetModel.createNewBudgets(NEW_TRANSPARENCY_BUDGETS)
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(0)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(7)
        })
      })
    })

    describe('when a budget already exists', () => {
      beforeEach(() => {
        jest.spyOn(QuarterBudgetModel, 'find').mockResolvedValue([VALID_QUARTER_BUDGET_1])
        jest.spyOn(QuarterBudgetModel, 'create').mockResolvedValue([VALID_QUARTER_BUDGET_2])
      })

      describe('when receiving the same budget', () => {
        const transparencyBudgets = [VALID_TRANSPARENCY_BUDGET_1]

        it('does not create the same budget', async () => {
          await QuarterBudgetModel.createNewBudgets(transparencyBudgets)
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(0)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(0)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(0)
        })
      })

      describe('when receiving several budgets that include a new one', () => {
        const transparencyBudgets = [VALID_TRANSPARENCY_BUDGET_1, VALID_TRANSPARENCY_BUDGET_2]

        it('creates only the new budget', async () => {
          await QuarterBudgetModel.createNewBudgets(transparencyBudgets)
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(0)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(7)
        })

        describe('if there is a problem while creating the category budgets', () => {
          beforeEach(() => {
            jest.spyOn(QuarterCategoryBudgetModel, 'create').mockImplementation(() => {
              throw new Error()
            })

            it('reverts the creation of the invalid quarter budget, and throws', async () => {
              await QuarterBudgetModel.createNewBudgets(transparencyBudgets)
              expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
              expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(1)
              expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(1)
              expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(0)
            })
          })
        })
      })

      describe('when receiving several budgets that include a new one and an invalid one', () => {
        const transparencyBudgets = [
          VALID_TRANSPARENCY_BUDGET_1,
          VALID_TRANSPARENCY_BUDGET_2,
          INVALID_CATEGORIES_NAME_TRANSPARENCY_BUDGET,
        ]

        beforeEach(() => {
          jest.spyOn(QuarterBudgetModel, 'find').mockResolvedValue([VALID_QUARTER_BUDGET_1])
          jest.spyOn(QuarterBudgetModel, 'create').mockResolvedValue([VALID_QUARTER_BUDGET_2])
          jest.spyOn(QuarterCategoryBudgetModel, 'create').mockResolvedValue({})
        })

        it('logs the budget it creates, and throws', async () => {
          const logSpy = jest.spyOn(console, 'log')

          try {
            await QuarterBudgetModel.createNewBudgets(transparencyBudgets)
            // eslint-disable-next-line no-empty
          } catch (e) {}
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(2)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(1)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(7)
          expect(logSpy).toHaveBeenCalledWith(`Created 1 new budgets`)
        })
      })
    })

    describe('when some budgets already exists', () => {
      beforeEach(() => {
        jest.spyOn(QuarterBudgetModel, 'find').mockResolvedValue([VALID_QUARTER_BUDGET_1, VALID_QUARTER_BUDGET_2])
        jest.spyOn(QuarterBudgetModel, 'create')
      })

      describe('when receiving an overlapping budget', () => {
        it('does not create any budget and throws an error', async () => {
          await expect(
            QuarterBudgetModel.createNewBudgets([
              VALID_TRANSPARENCY_BUDGET_1,
              VALID_TRANSPARENCY_BUDGET_2,
              OVERLAPPING_TRANSPARENCY_BUDGET,
            ])
          ).rejects.toThrow(`There are overlapping budgets with: ${JSON.stringify(OVERLAPPING_TRANSPARENCY_BUDGET)}`)
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(0)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(0)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(0)
        })
      })

      describe('when receiving a new invalid budget', () => {
        it('does not create any budget and throws an error', async () => {
          await expect(
            QuarterBudgetModel.createNewBudgets([
              VALID_TRANSPARENCY_BUDGET_1,
              VALID_TRANSPARENCY_BUDGET_2,
              INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET,
            ])
          ).rejects.toThrow(
            `Categories percentages do not amount to 100 for budget: ${JSON.stringify(
              INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET
            )}`
          )
          expect(QuarterBudgetModel.find).toHaveBeenCalledTimes(1)
          expect(QuarterBudgetModel.create).toHaveBeenCalledTimes(0)
          expect(QuarterBudgetModel.delete).toHaveBeenCalledTimes(0)
          expect(QuarterCategoryBudgetModel.create).toHaveBeenCalledTimes(0)
        })
      })
    })
  })
})
