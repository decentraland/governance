import Time from './Time'

export function getPreviousMonthStartAndEnd(today: Date) {
  const pastMonth = Time.utc(today).subtract(1, 'month')
  const start = pastMonth.startOf('month').toDate()
  const end = pastMonth.endOf('month').toDate()

  return { start, end }
}
