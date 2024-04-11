import sum from 'lodash/sum'

import { VestingInfo, VestingLog } from '../../clients/VestingData'
import { GOVERNANCE_API } from '../../constants'
import { ContractVersion, TopicsByVersion } from '../../utils/contracts/vesting'
import Time from '../../utils/date/Time'
import { ProposalStatus } from '../Proposal/types'

import { FinancialRecord, UpdateAttributes, UpdateStatus } from './types'

const TOPICS_V1 = TopicsByVersion[ContractVersion.V1]
const TOPICS_V2 = TopicsByVersion[ContractVersion.V2]

const RELEASE_TOPICS = new Set([TOPICS_V1.RELEASE, TOPICS_V2.RELEASE])

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

export function getFundsReleasedSinceLatestUpdate(
  latestUpdate: Omit<UpdateAttributes, 'id' | 'proposal_id'> | undefined,
  releases: VestingLog[] | undefined,
  beforeDate?: Date
): { releasedFunds: number; releasesTxCount: number; latestReleaseTimestamp?: string } {
  if (!releases || releases.length === 0) return { releasedFunds: 0, releasesTxCount: 0 }

  if (!latestUpdate) {
    return { releasedFunds: sum(releases.map(({ amount }) => amount || 0)), releasesTxCount: releases.length }
  }

  const { completion_date } = latestUpdate

  const releasesSinceLatestUpdate = releases.filter(
    ({ timestamp }) =>
      Time(timestamp).isAfter(completion_date) && (beforeDate ? Time(timestamp).isBefore(beforeDate) : true)
  )
  return {
    releasedFunds: sum(releasesSinceLatestUpdate.map(({ amount }) => amount || 0)),
    releasesTxCount: releasesSinceLatestUpdate.length,
    latestReleaseTimestamp: releasesSinceLatestUpdate[0]?.timestamp,
  }
}

export function getReleases(vestings: VestingInfo[]) {
  return vestings
    .flatMap(({ logs }) => logs)
    .filter(({ topic }) => RELEASE_TOPICS.has(topic))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getLatestUpdate(publicUpdates: UpdateAttributes[], beforeDate?: Date): UpdateAttributes | undefined {
  if (publicUpdates.length === 0) return undefined

  const filteredUpdates = publicUpdates
    .filter((update) => update.status === UpdateStatus.Done || update.status === UpdateStatus.Late)
    .sort((a, b) => (Time(a.completion_date).isAfter(b.completion_date) ? -1 : 0))

  if (filteredUpdates.length === 0) return undefined

  if (!beforeDate) return filteredUpdates[0]

  return filteredUpdates.find((update) => Time(update.completion_date).isBefore(beforeDate))
}

export function getDisclosedAndUndisclosedFunds(
  releasedForThisUpdate: number,
  financialRecords?: FinancialRecord[] | null
) {
  const disclosedFunds = financialRecords?.reduce((acc, financialRecord) => acc + financialRecord.amount, 0) || 0
  const undisclosedFunds = disclosedFunds <= releasedForThisUpdate ? releasedForThisUpdate - disclosedFunds : 0
  return { disclosedFunds, undisclosedFunds }
}
