import { TransparencyVesting } from '../clients/Transparency'
import { ProjectStatus } from '../entities/Grant/types'
import { Project, ProposalAttributes } from '../entities/Proposal/types'

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
    Time.from(startAt, { utc: true }).add(15, 'minutes').format(Time.Formats.GoogleCalendar),
  ]
  params.set('dates', dates.join('/'))

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`
}

export function isCurrentProject(status?: ProjectStatus) {
  return status === ProjectStatus.InProgress || status === ProjectStatus.Paused || status === ProjectStatus.Pending
}

export function isCurrentQuarterProject(startAt?: number) {
  if (!startAt) {
    return false
  }

  const currentQuarterStartDate = Time().startOf('quarter')
  return Time.unix(startAt || 0).isAfter(currentQuarterStartDate)
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
