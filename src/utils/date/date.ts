import Time from './Time'

export function getAMonthAgo(now: Date) {
  return Time(now).subtract(1, 'month').toDate()
}

export function getAWeekAgo(now: Date) {
  return Time(now).subtract(1, 'week').toDate()
}
