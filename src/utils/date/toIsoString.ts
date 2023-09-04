import Time from './Time'

export function toIsoStringDate(dateStr: string) {
  const parsedDate = Time.utc(dateStr)
  if (!parsedDate.isValid()) {
    throw new Error('Invalid date format')
  }
  return parsedDate.toISOString()
}
