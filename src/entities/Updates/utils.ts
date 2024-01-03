import sum from 'lodash/sum'

import { VestingLog } from '../../clients/VestingData'
import { GOVERNANCE_API } from '../../constants'
import Time from '../../utils/date/Time'
import { ProposalStatus } from '../Proposal/types'

import { UpdateAttributes, UpdateStatus } from './types'

export function isProposalStatusWithUpdates(proposalStatus?: ProposalStatus) {
  return proposalStatus === ProposalStatus.Enacted
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

export function getUpdateUrl(updateId: string, proposalId: string) {
  const params = new URLSearchParams({ id: updateId, proposalId })
  const target = new URL(GOVERNANCE_API)
  target.pathname = '/update/'
  target.search = '?' + params.toString()
  return target.toString()
}

export function getUpdateNumber(publicUpdates?: UpdateAttributes[] | null, updateId?: string | null) {
  if (!publicUpdates || !updateId) return NaN
  const updateIdx = Number(publicUpdates.findIndex((item) => item.id === updateId))
  return publicUpdates.length > 0 && updateIdx >= 0 ? publicUpdates.length - updateIdx : NaN
}

export function getFundsReleasedSinceLastUpdate(
  updates: UpdateAttributes[] | undefined,
  releases: VestingLog[] | undefined
) {
  if (!releases || releases.length === 0) return 0

  const lastUpdate = updates?.filter(
    (update) => update.status === UpdateStatus.Done || update.status === UpdateStatus.Late
  )?.[0]

  if (!lastUpdate) {
    return sum(releases.map(({ amount }) => amount || 0))
  }

  const { completion_date } = lastUpdate

  return sum(
    releases.filter(({ timestamp }) => Time(timestamp).isAfter(completion_date)).map(({ amount }) => amount || 0)
  )
}
