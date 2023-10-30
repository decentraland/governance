import {
  INVALID_CATEGORIES_AMOUNT_TRANSPARENCY_BUDGET,
  VALID_TRANSPARENCY_BUDGET_1,
} from '../../services/BudgetService.test'
import { NewGrantCategory } from '../Grant/types'

import { getCategoryBudgetTotal, toNewGrantCategory, validateCategoryBudgets } from './utils'

jest.mock('discord.js', () => jest.fn())
jest.mock('@pushprotocol/restapi/src/index.js', () => jest.fn())

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

describe('toNewGrantCategory', () => {
  it('returns a new grant category from a string', () => {
    expect(toNewGrantCategory('In-World Content')).toEqual(NewGrantCategory.InWorldContent)
  })
  it('returns a new grant category from valid new grant category', () => {
    expect(toNewGrantCategory(NewGrantCategory.InWorldContent)).toEqual(NewGrantCategory.InWorldContent)
  })
  it('returns a new grant category from a snake cased string', () => {
    expect(toNewGrantCategory('in_world_content')).toEqual(NewGrantCategory.InWorldContent)
  })
  it('throws an error if it cant parse to the correct grant category', () => {
    expect(() => toNewGrantCategory('in_world_conten')).toThrow(
      'Attempted to parse an invalid NewGrantCategory: in_world_conten'
    )
  })
  it('throws an error if it tries to parse an empty string', () => {
    expect(() => toNewGrantCategory('')).toThrow('Attempted to parse an invalid NewGrantCategory: ')
  })
  it('throws an error if it attempts to parse a null category', () => {
    expect(() => toNewGrantCategory(null)).toThrow('Attempted to parse an invalid NewGrantCategory: null')
  })
})
