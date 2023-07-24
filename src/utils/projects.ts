import { ProposalAttributes } from '../entities/Proposal/types'
import { proposalUrl } from '../entities/Proposal/utils'

import Time from './date/Time'

export function getHighBudgetVpThreshold(budget: number) {
  return 1200000 + budget * 40
}

export function getGoogleCalendarUrl(proposal: ProposalAttributes, startAt?: string) {
  const { id, title, start_at } = proposal
  const date = startAt || start_at
  const url = proposalUrl(id)
  const params = new URLSearchParams()
  params.set('text', title)
  params.set('details', `${url}`)
  const startAtDate = Time.from(date, { utc: true })
  const dates = [
    startAtDate.format(Time.Formats.GoogleCalendar),
    Time.from(date, { utc: true }).add(1, 'hour').format(Time.Formats.GoogleCalendar),
  ]
  params.set('dates', dates.join('/'))

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`
}
