import { toIsoStringDate } from './toIsoString'

describe('convertToISO function', () => {
  it('should convert a valid date string to ISO format', () => {
    const dateStr = '2023-09-04'
    const isoDate = toIsoStringDate(dateStr)
    expect(isoDate).toEqual('2023-09-04T00:00:00.000Z')
  })

  it('should throw an error for an invalid date string', () => {
    const invalidDateStr = 'invalid-date'
    expect(() => toIsoStringDate(invalidDateStr)).toThrow('Invalid date format')
  })

  it('should not change the hours and minutes if they are already defined', () => {
    const dateStr = '2023-07-21T13:57:28.882Z'
    const isoDate = toIsoStringDate(dateStr)
    expect(isoDate).toEqual(dateStr)
  })

  it('should add the missing part of the date string', () => {
    const dateStr = '2023-07-21T13:57'
    const isoDate = toIsoStringDate(dateStr)
    expect(isoDate).toEqual('2023-07-21T13:57:00.000Z')
  })

  it('should not change the minutes and seconds if they are already defined', () => {
    const dateStr = '2023-09-30T23:59:59.999Z'
    const isoDate = toIsoStringDate(dateStr)
    expect(isoDate).toEqual('2023-09-30T23:59:59.999Z')
  })
})
