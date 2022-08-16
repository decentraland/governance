import Time from 'decentraland-gatsby/dist/utils/date/Time'

export const formatDate = (date: Date): string => Time.utc(date).fromNow()

export const abbreviateTimeDifference = (timeDifference: string) => {
  return timeDifference
    .replace(/(\d)+.seconds/, 's')
    .replace('a few ', '')
    .replace(/([a-zA-Z])+.minute/, '1m')
    .replace(' minutes', 'm')
    .replace(/([a-zA-Z])+.hour/, '1h')
    .replace(/.hour(s)?/, 'h')
    .replace(/([a-zA-Z])+.day/, '1d')
    .replace(/.day(s)?/, 'd')
    .replace(/([a-zA-Z])+.week/, '1w')
    .replace(/.week(s)?/, 'w')
    .replace(/([a-zA-Z])+.month/, '1mo')
    .replace(/.month(s)?/, 'mo')
    .replace(/([a-zA-Z])+.year/, '1y')
    .replace(/.year(s)?/, 'y')
}
