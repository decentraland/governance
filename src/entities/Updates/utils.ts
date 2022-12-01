import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { ProposalStatus } from '../Proposal/types'

import { UpdateAttributes, UpdateStatus } from './types'

const PROPOSAL_STATUS_WITH_UPDATES = new Set([ProposalStatus.Passed, ProposalStatus.Enacted])
export function isProposalStatusWithUpdates(proposalStatus?: ProposalStatus) {
  return PROPOSAL_STATUS_WITH_UPDATES.has(proposalStatus as ProposalStatus)
}

export const getPublicUpdates = (updates: UpdateAttributes[]): UpdateAttributes[] => {
  const now = new Date()

  const scheduledUpdates = updates
    .filter((item) => (!!item.completion_date && !!item.due_date) || Time.utc(item.due_date).isBefore(now))
    .sort((a, b) => (Time(a.due_date).isAfter(b.due_date) ? -1 : 0))

  const outOfScheduleUpdates = updates
    .filter((item) => !!item.completion_date && !item.due_date)
    .sort((a, b) => (Time(a.completion_date).isAfter(b.completion_date) ? -1 : 0))

  return [...outOfScheduleUpdates, ...scheduledUpdates]
}

export const getCurrentUpdate = (updates: UpdateAttributes[]): UpdateAttributes | null => {
  const now = new Date()

  const upcomingUpdates = updates.filter((item) => Time(item.due_date).isAfter(now))

  if (!(upcomingUpdates && upcomingUpdates.length > 0)) {
    return null
  }

  const nextUpdate = upcomingUpdates.reduce((prev, current) =>
    prev.due_date && current.due_date && prev.due_date < current.due_date ? prev : current
  )

  return nextUpdate
}

export const getNextPendingUpdate = (updates: UpdateAttributes[]): UpdateAttributes | null => {
  const now = new Date()

  const upcomingPendingUpdates = updates.filter(
    (item) => item.status === UpdateStatus.Pending && Time(item.due_date).isAfter(now)
  )

  if (!(upcomingPendingUpdates && upcomingPendingUpdates.length > 0)) {
    return null
  }

  const nextUpdate = upcomingPendingUpdates.reduce((prev, current) =>
    prev.due_date && current.due_date && prev.due_date < current.due_date ? prev : current
  )

  return nextUpdate
}

export const getPendingUpdates = (updates: UpdateAttributes[]): UpdateAttributes[] => {
  const pendingUpdates = updates.filter((item) => item.status === UpdateStatus.Pending)

  return pendingUpdates
}

const THRESHOLD_DAYS_TO_UPDATE = 15

export const isBetweenLateThresholdDate = (dueDate?: Date) => {
  if (!dueDate) {
    return true
  }

  const newDueDate = Time(dueDate).add(THRESHOLD_DAYS_TO_UPDATE, 'day')

  return Time().isBefore(newDueDate)
}
