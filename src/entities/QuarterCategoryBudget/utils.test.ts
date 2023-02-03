import {
  INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET,
  VALID_TRANSPARENCY_BUDGET_1,
} from '../../services/BudgetService.test'

import { getCategoryBudgetTotal, validateCategoryBudgets } from './utils'

describe('getCategoryBudgetTotal', () => {
  it('returns a percentage of the budget total', () => {
    expect(getCategoryBudgetTotal(10, 100)).toEqual(10)
  })

  it('fails if the percentage is invalid', () => {
    expect(() => getCategoryBudgetTotal(-10, 100)).toThrowError('Invalid category percentage')
    expect(() => getCategoryBudgetTotal(101, 100)).toThrowError('Invalid category percentage')
  })
})

describe('validateCategoryBudgets', () => {
  it('does not throw an error if the sum of the category percentages is 100', () => {
    expect(() => validateCategoryBudgets(VALID_TRANSPARENCY_BUDGET_1)).not.toThrowError()
  })

  it('throws if categories do not amount to 100', () => {
    expect(() => validateCategoryBudgets(INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET)).toThrowError(
      `Categories percentages do not amount to 100 for budget: ${JSON.stringify(
        INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET
      )}`
    )
  })
})
