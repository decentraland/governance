import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { UpdateAttributes, UpdateStatus } from './types'

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

export const getNextUpdate = (updates: UpdateAttributes[]): UpdateAttributes | null => {
  const now = new Date()

  const remainingUpdates = updates.filter((item) => (item.due_date ? Time(item.due_date).isAfter(now) : item))

  if (!(remainingUpdates && remainingUpdates.length > 0)) {
    return null
  }

  const nextUpdate = remainingUpdates.reduce((prev, current) =>
    prev.due_date && current.due_date && prev.due_date < current.due_date ? prev : current
  )

  if (nextUpdate.completion_date) {
    return null
  }

  return nextUpdate
}

export const getRemainingUpdates = (updates: UpdateAttributes[]): UpdateAttributes[] => {
  const remainingUpdates = updates.filter((item) => item.status === UpdateStatus.Pending)

  return remainingUpdates
}
