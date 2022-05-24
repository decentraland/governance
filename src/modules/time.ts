import Time from 'decentraland-gatsby/dist/utils/date/Time'

export const formatDate = (date: Date): string => Time.utc(date).fromNow()
