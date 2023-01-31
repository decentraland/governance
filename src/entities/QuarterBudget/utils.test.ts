import { QuarterBudgetAttributes } from './types'
import { thereAreNoOverlappingBudgets } from './utils'

const TEST_DATA: Omit<QuarterBudgetAttributes, 'start_at' | 'finish_at'> = {
  id: '1',
  total: 100,
  created_at: new Date('2023-01-01'),
  updated_at: new Date('2023-01-01'),
}
const EXISTING_BUDGETS = [
  { ...TEST_DATA, start_at: new Date('2023-01-01'), finish_at: new Date('2023-04-30') },
  { ...TEST_DATA, start_at: new Date('2023-05-01'), finish_at: new Date('2023-08-31') },
]

describe('thereAreNoOverlappingBudgets', () => {
  it('returns true when no budgets overlap with the given dates', () => {
    const startAt = new Date('2023-09-01')
    const finishAt = new Date('2023-12-31')
    expect(thereAreNoOverlappingBudgets(startAt, finishAt, EXISTING_BUDGETS)).toBe(true)
  })

  it('returns true when the end of a budget matches the start of a budget=', () => {
    expect(thereAreNoOverlappingBudgets(new Date('2022-09-01'), new Date('2023-01-01'), EXISTING_BUDGETS)).toBe(true)
  })

  it('returns false when a budget overlaps with the given dates', () => {
    expect(thereAreNoOverlappingBudgets(new Date('2022-09-01'), new Date('2023-01-02'), EXISTING_BUDGETS)).toBe(false)
    expect(thereAreNoOverlappingBudgets(new Date('2023-08-01'), new Date('2023-09-30'), EXISTING_BUDGETS)).toBe(false)
    expect(thereAreNoOverlappingBudgets(new Date('2023-02-01'), new Date('2023-03-01'), EXISTING_BUDGETS)).toBe(false)
  })
})
