import Time from './Time'

export function getMonthsBetweenDates(startDate: Date, endDate: Date) {
  const starts = Time.utc(startDate)
  const ends = Time.utc(endDate)

  if (starts.isAfter(ends)) {
    throw new Error('Start date must be before end date')
  }

  const diff = Time.preciseDiff(starts, ends, true)
  return {
    months: diff.years * 12 + diff.months,
    extraDays: diff.days,
  }
}
