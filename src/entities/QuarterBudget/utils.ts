import { QuarterBudgetAttributes } from './types'

export function thereAreNoOverlappingBudgets(
  startAt: Date,
  finishAt: Date,
  existingBudgets: QuarterBudgetAttributes[]
) {
  return !existingBudgets.some(
    (existingBudget) =>
      (existingBudget.start_at <= startAt && existingBudget.finish_at > startAt) ||
      (existingBudget.start_at > startAt && existingBudget.start_at < finishAt)
  )
}
