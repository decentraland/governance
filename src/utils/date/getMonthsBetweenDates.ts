const moment = require('moment')
require('moment-precise-range-plugin')

export function getMonthsBetweenDates(startDate: Date, endDate: Date) {
  const starts = moment.utc(startDate)
  const ends = moment.utc(endDate)
  const diff = moment.preciseDiff(starts, ends, true)
  return {
    months: diff.years * 12 + diff.months,
    extraDays: diff.days,
  }
}
