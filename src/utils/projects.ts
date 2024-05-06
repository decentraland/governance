import { TransparencyVesting } from '../clients/Transparency'
import { ProjectStatus } from '../entities/Grant/types'
import { Project, ProposalAttributes } from '../entities/Proposal/types'

import Time from './date/Time'

function getQuarterDates(quarter?: number, year?: number) {
  if (!quarter && !year) {
    return { startDate: undefined, endDate: undefined }
  }

  if (!year) {
    console.error('Year is required')
    return { startDate: undefined, endDate: undefined }
  }

  if (!quarter) {
    const startDate = Time(`${year}-01-01`).format('YYYY-MM-DD')
    const endDate = Time(`${year}-12-31`).format('YYYY-MM-DD')
    return { startDate, endDate }
  }

  if (quarter < 1 || quarter > 4) {
    console.error('Quarter should be between 1 and 4')
    return { startDate: undefined, endDate: undefined }
  }

  const startMonth = (quarter - 1) * 3 + 1

  const endMonth = startMonth + 2

  const startDate = Time(`${year}-${startMonth}-01`).startOf('month').format('YYYY-MM-DD')
  const endDate = Time(`${year}-${endMonth}-01`).endOf('month').add(1, 'day').format('YYYY-MM-DD')

  return { startDate, endDate }
}

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
    Time.from(startAt, { utc: true }).add(15, 'minutes').format(Time.Formats.GoogleCalendar),
  ]
  params.set('dates', dates.join('/'))

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`
}

export function isCurrentProject(status?: ProjectStatus) {
  return status === ProjectStatus.InProgress || status === ProjectStatus.Paused || status === ProjectStatus.Pending
}

export function isCurrentQuarterProject(year: number, quarter: number, startAt?: number) {
  if (!startAt) {
    return false
  }

  const { startDate, endDate } = getQuarterDates(quarter, year)

  if (!startDate || !endDate) {
    return false
  }

  return Time.unix(startAt || 0).isAfter(startDate) && Time.unix(startAt || 0).isBefore(endDate)
}

function getProjectVestingData(proposal: ProposalAttributes, vesting: TransparencyVesting) {
  if (proposal.enacting_tx) {
    return {
      status: ProjectStatus.Finished,
      enacting_tx: proposal.enacting_tx,
      enacted_at: Time(proposal.updated_at).unix(),
    }
  }

  if (!vesting) {
    return {
      status: ProjectStatus.Pending,
    }
  }

  const {
    vesting_status: status,
    token,
    vesting_start_at,
    vesting_finish_at,
    vesting_total_amount,
    vesting_released,
    vesting_releasable,
  } = vesting

  return {
    status,
    token,
    enacted_at: Time(vesting_start_at).unix(),
    contract: {
      vesting_total_amount: Math.round(vesting_total_amount),
      vestedAmount: Math.round(vesting_released + vesting_releasable),
      releasable: Math.round(vesting_releasable),
      released: Math.round(vesting_released),
      start_at: Time(vesting_start_at).unix(),
      finish_at: Time(vesting_finish_at).unix(),
    },
  }
}

export function createProject(proposal: ProposalAttributes, vesting?: TransparencyVesting): Project {
  const vestingData = vesting ? getProjectVestingData(proposal, vesting) : {}

  return {
    id: proposal.id,
    title: proposal.title,
    user: proposal.user,
    type: proposal.type,
    size: proposal.configuration.size || proposal.configuration.funding,
    created_at: proposal.created_at.getTime(),
    configuration: {
      category: proposal.configuration.category || proposal.type,
      tier: proposal.configuration.tier,
    },
    ...vestingData,
  }
}
