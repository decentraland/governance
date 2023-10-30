import {
  VALID_TRANSPARENCY_BUDGET_1,
  VALID_TRANSPARENCY_BUDGET_2,
  VALID_TRANSPARENCY_BUDGET_3,
} from '../../services/BudgetService.test'
import Time from '../../utils/date/Time'

import { QuarterBudgetAttributes } from './types'
import {
  budgetExistsForStartingDate,
  getQuarterEndDate,
  getQuarterStartDate,
  getSortedBudgets,
  thereAreNoOverlappingBudgets,
} from './utils'

const TEST_DATA: Omit<QuarterBudgetAttributes, 'start_at' | 'finish_at'> = {
  id: '1',
  total: 100,
  created_at: new Date('2023-01-01'),
  updated_at: new Date('2023-01-01'),
}

const QUARTER_1_START_DATE = getQuarterStartDate('2023-01-01T00:00:00Z')
const QUARTER_2_START_DATE = getQuarterStartDate('2023-04-01T00:00:00Z')
const QUARTER_2_END_DATE = getQuarterEndDate(QUARTER_2_START_DATE)

const EXISTING_BUDGETS: QuarterBudgetAttributes[] = [
  { ...TEST_DATA, start_at: QUARTER_1_START_DATE, finish_at: getQuarterEndDate(QUARTER_1_START_DATE) },
  { ...TEST_DATA, start_at: QUARTER_2_START_DATE, finish_at: QUARTER_2_END_DATE },
]

jest.mock('discord.js', () => jest.fn())
jest.mock('@pushprotocol/restapi/src/index.js', () => jest.fn())

describe('thereAreNoOverlappingBudgets', () => {
  it('returns true when no budgets overlap with the given dates', () => {
    const startAt = Time(QUARTER_2_END_DATE).add(1, 'day').toDate()
    const finishAt = getQuarterEndDate(startAt)
    expect(thereAreNoOverlappingBudgets(startAt, finishAt, EXISTING_BUDGETS)).toBe(true)
  })

  it('returns true when the end of a budget matches the start of a budget=', () => {
    const startAt = QUARTER_2_END_DATE
    const finishAt = getQuarterEndDate(QUARTER_2_END_DATE)
    expect(thereAreNoOverlappingBudgets(startAt, finishAt, EXISTING_BUDGETS)).toBe(true)
  })

  it('returns false when a budget overlaps with the given dates', () => {
    expect(thereAreNoOverlappingBudgets(new Date('2022-010-02'), new Date('2023-01-02'), EXISTING_BUDGETS)).toBe(false)
    expect(thereAreNoOverlappingBudgets(new Date('2023-06-01'), new Date('2023-08-31'), EXISTING_BUDGETS)).toBe(false)
    expect(thereAreNoOverlappingBudgets(new Date('2023-02-01'), new Date('2023-03-01'), EXISTING_BUDGETS)).toBe(false)
  })
})

describe('getQuarterStartDate', () => {
  it('gets the day of the month at the beginning of the day', () => {
    expect(getQuarterStartDate('2023-01-01T00:00:00Z')).toEqual(new Date('2023-01-01T00:00:00Z'))
  })
  it('gets the beginning of the month for string dates without UTC format', () => {
    expect(() => getQuarterStartDate('2023-01-01T00:00:00')).toThrowError()
  })
  it('gets the beginning of the month for a date with the wrong hour', () => {
    expect(getQuarterStartDate('2023-01-01T12:00:00Z')).toEqual(new Date('2023-01-01T00:00:00Z'))
  })
  it('gets the beginning of the month for a date without specified hours', () => {
    expect(getQuarterStartDate('2023-01-01T00:00:00Z')).toEqual(new Date('2023-01-01T00:00:00Z'))
  })
})

describe('getQuarterEndDate', () => {
  it('gets the same day of the month, three months later', () => {
    expect(getQuarterEndDate(new Date('2023-01-01T00:00:00Z'))).toEqual(new Date('2023-04-01T00:00:00Z'))
    expect(getQuarterEndDate(new Date('2023-04-01T00:00:00Z'))).toEqual(new Date('2023-07-01T00:00:00Z'))
    expect(getQuarterEndDate(new Date('2023-07-01T00:00:00Z'))).toEqual(new Date('2023-10-01T00:00:00Z'))
    expect(getQuarterEndDate(new Date('2023-10-01T00:00:00Z'))).toEqual(new Date('2024-01-01T00:00:00Z'))

    expect(getQuarterEndDate(new Date('2023-01-02T00:00:00Z'))).toEqual(new Date('2023-04-02T00:00:00Z'))
    expect(getQuarterEndDate(new Date('2023-04-03T00:00:00Z'))).toEqual(new Date('2023-07-03T00:00:00Z'))
    expect(getQuarterEndDate(new Date('2023-07-04T00:00:00Z'))).toEqual(new Date('2023-10-04T00:00:00Z'))
    expect(getQuarterEndDate(new Date('2023-10-05T00:00:00Z'))).toEqual(new Date('2024-01-05T00:00:00Z'))
  })
})

describe('getSortedBudgets', () => {
  it('returns a list budgets sorted by increasing start date', () => {
    const unsortedBudgets = [VALID_TRANSPARENCY_BUDGET_2, VALID_TRANSPARENCY_BUDGET_3, VALID_TRANSPARENCY_BUDGET_1]
    expect(getSortedBudgets(unsortedBudgets)).toStrictEqual([
      VALID_TRANSPARENCY_BUDGET_1,
      VALID_TRANSPARENCY_BUDGET_2,
      VALID_TRANSPARENCY_BUDGET_3,
    ])
  })
})

describe('budgetExistsForStartingDate', () => {
  it('returns true if a budget has the same starting date as the received', () => {
    expect(budgetExistsForStartingDate(EXISTING_BUDGETS, getQuarterStartDate('2023-01-01T00:00:00Z'))).toBe(true)
    expect(budgetExistsForStartingDate(EXISTING_BUDGETS, getQuarterStartDate('2023-04-01T00:00:00Z'))).toBe(true)
  })
  it('returns false if no budget has the same starting date as the received', () => {
    expect(budgetExistsForStartingDate(EXISTING_BUDGETS, getQuarterStartDate('2023-01-02T00:00:00Z'))).toBe(false)
    expect(budgetExistsForStartingDate(EXISTING_BUDGETS, getQuarterStartDate('2023-03-30T00:00:00Z'))).toBe(false)
  })
})
