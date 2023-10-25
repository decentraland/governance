import {
  INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET,
  INVALID_CATEGORIES_NAME_TRANSPARENCY_BUDGET,
  OVERLAPPING_TRANSPARENCY_BUDGET,
  VALID_TRANSPARENCY_BUDGET_1,
  VALID_TRANSPARENCY_BUDGET_2,
} from '../../services/BudgetService.test'
import Time from '../../utils/date/Time'
import QuarterCategoryBudgetModel from '../QuarterCategoryBudget/model'

import QuarterBudgetModel from './model'
import { BudgetQueryResult } from './types'
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

jest.mock('discord.js', () => jest.fn())

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

  describe('parseCurrentBudget', () => {
    it('returns a CurrentBudget', () => {
      const results: BudgetQueryResult[] = [
        {
          id: 'budget_id',
          category: 'Accelerator',
          category_total: 105105,
          category_allocated: 5105,
          start_at: '2023-01-01 00:00:00Z',
          finish_at: '2023-04-01 00:00:00Z',
          total: 1501500,
        },
        {
          id: 'budget_id',
          category: 'Core Unit',
          category_total: 225225,
          category_allocated: 225225,
          start_at: '2023-01-01 00:00:00Z',
          finish_at: '2023-04-01 00:00:00Z',
          total: 1501500,
        },
        {
          id: 'budget_id',
          category: 'Documentation',
          category_total: 45045,
          category_allocated: 60000,
          start_at: '2023-01-01 00:00:00Z',
          finish_at: '2023-04-01 00:00:00Z',
          total: 1501500,
        },
        {
          id: 'budget_id',
          category: 'In-World Content',
          category_total: 300300,
          category_allocated: 0,
          start_at: '2023-01-01 00:00:00Z',
          finish_at: '2023-04-01 00:00:00Z',
          total: 1501500,
        },
        {
          id: 'budget_id',
          category: 'Platform',
          category_total: 600600,
          category_allocated: 0,
          start_at: '2023-01-01 00:00:00Z',
          finish_at: '2023-04-01 00:00:00Z',
          total: 1501500,
        },
        {
          id: 'budget_id',
          category: 'Social Media Content',
          category_total: 75075,
          category_allocated: 0,
          start_at: '2023-01-01 00:00:00Z',
          finish_at: '2023-04-01 00:00:00Z',
          total: 1501500,
        },
        {
          id: 'budget_id',
          category: 'Sponsorship',
          category_total: 150150,
          category_allocated: 0,
          start_at: '2023-01-01 00:00:00Z',
          finish_at: '2023-04-01 00:00:00Z',
          total: 1501500,
        },
      ]
      expect(QuarterBudgetModel.parseBudget(results)).toStrictEqual({
        categories: {
          accelerator: {
            allocated: 5105,
            available: 100000,
            total: 105105,
          },
          core_unit: {
            allocated: 225225,
            available: 0,
            total: 225225,
          },
          documentation: {
            allocated: 60000,
            available: -14955,
            total: 45045,
          },
          in_world_content: {
            allocated: 0,
            available: 300300,
            total: 300300,
          },
          platform: {
            allocated: 0,
            available: 600600,
            total: 600600,
          },
          social_media_content: {
            allocated: 0,
            available: 75075,
            total: 75075,
          },
          sponsorship: {
            allocated: 0,
            available: 150150,
            total: 150150,
          },
        },
        finish_at: Time.date('2023-04-01T00:00:00.000Z'),
        start_at: Time.date('2023-01-01T00:00:00.000Z'),
        total: 1501500,
        allocated: 290330,
        id: 'budget_id',
      })
    })
  })
})
