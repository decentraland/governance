import { TransparencyBudget } from '../../clients/Transparency'
import Time from '../../utils/date/Time'

import { QuarterBudgetAttributes } from './types'

function isUTCFormat(date: string) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/
  return dateRegex.test(date)
}

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

export function getQuarterEndDate(quarterStartDate: Date) {
  return new Date(Time.utc(quarterStartDate.toISOString()).add(3, 'months').toISOString())
}

export function getQuarterStartDate(quarterStartDate: string) {
  if (!isUTCFormat(quarterStartDate)) {
    throw new Error(`Invalid date format. Expected UTC format. Received ${quarterStartDate}`)
  }
  const startDate = new Date(quarterStartDate)
  return new Date(Time.utc(startDate).startOf('day').toISOString())
}

export function getSortedBudgets(transparencyBudgets: TransparencyBudget[]) {
  return transparencyBudgets.sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date))
}

export function budgetExistsForStartingDate(existingBudgets: QuarterBudgetAttributes[], startAt: Date) {
  return existingBudgets.some((existingBudget) => {
    return existingBudget.start_at.toISOString() === startAt.toISOString()
  })
}
