import Time from './Time'

export function getMonthsBetweenDates(startDate: Date, endDate: Date) {
  const starts = Time.utc(startDate)
  const ends = Time.utc(endDate)
  // @ts-ignore
  const diff = Time.preciseDiff(starts, ends, true)
  return {
    months: diff.years * 12 + diff.months,
    extraDays: diff.days,
  }
}
