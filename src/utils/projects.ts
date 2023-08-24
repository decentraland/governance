import { ProjectStatus } from '../entities/Grant/types'

import Time from './date/Time'

export function getHighBudgetVpThreshold(budget: number) {
  return 1200000 + budget * 40
}

export function getGoogleCalendarUrl({
  title,
  details,
  startAt,
}: {
  title: string
  details: string
  startAt: string | Date
}) {
  const params = new URLSearchParams()
  params.set('text', title)
  params.set('details', details)
  const startAtDate = Time.from(startAt, { utc: true })
  const dates = [
    startAtDate.format(Time.Formats.GoogleCalendar),
    Time.from(startAt, { utc: true }).add(1, 'hour').format(Time.Formats.GoogleCalendar),
  ]
  params.set('dates', dates.join('/'))

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`
}

export function isCurrentProject(status?: ProjectStatus) {
  return status === ProjectStatus.InProgress || status === ProjectStatus.Paused || status === ProjectStatus.Pending
}

export function isCurrentQuarterProject(startAt?: number) {
  const currentQuarterStartDate = Time().startOf('quarter')
  return Time(startAt).isAfter(currentQuarterStartDate)
}
