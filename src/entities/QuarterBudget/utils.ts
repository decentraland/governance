import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { TransparencyBudget } from '../../clients/DclData'

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

function toUtcTime(quarterStartDate: string | Date) {
  return Time(quarterStartDate).utc(true).startOf('day')
}

export function getQuarterEndDate(quarterStartDate: Date) {
  return new Date(toUtcTime(quarterStartDate).add(3, 'months').toISOString())
}

export function getQuarterStartDate(quarterStartDate: string) {
  return new Date(toUtcTime(quarterStartDate).toISOString())
}

export function getSortedBudgets(transparencyBudgets: TransparencyBudget[]) {
  return transparencyBudgets.sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date))
}

export function budgetExistsForStartingDate(existingBudgets: QuarterBudgetAttributes[], startAt: Date) {
  return existingBudgets.some((existingBudget) => {
    return existingBudget.start_at.toISOString() === startAt.toISOString()
  })
}
