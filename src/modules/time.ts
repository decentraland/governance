import Time from 'decentraland-gatsby/dist/utils/date/Time'

export const formatDate = (date: Date): string => {
  const timeZoneOffset = new Date().getTimezoneOffset()

  return Time(date).utcOffset(timeZoneOffset).utc(true).fromNow()
}