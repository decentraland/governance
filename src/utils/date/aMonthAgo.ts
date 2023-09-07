import Time from './Time'

export function getAMonthAgo(now: Date) {
  const nowDayjs = Time(now)
  return nowDayjs.subtract(1, 'month').toDate()
}
