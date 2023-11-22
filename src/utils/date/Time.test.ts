import Time, { abbreviateTimeDifference } from './Time'

describe(`utils/date/Time`, () => {
  test(`parse time input`, () => {
    expect(Time('00:00', 'HH:mm').getTime()).toBe(0)
    expect(Time('00:01', 'HH:mm').getTime()).toBe(Time.Minute)
    expect(Time('01:00', 'HH:mm').getTime()).toBe(Time.Hour)
    expect(Time('23:59', 'HH:mm').getTime()).toBe(23 * Time.Hour + 59 * Time.Minute)
    expect(Time('24:00', 'HH:mm').getTime()).toBe(Time.Day)
    expect(Time.utc('00:00', 'HH:mm').getTime()).toBe(0)
    expect(Time.utc('00:01', 'HH:mm').getTime()).toBe(Time.Minute)
    expect(Time.utc('01:00', 'HH:mm').getTime()).toBe(Time.Hour)
    expect(Time.utc('23:59', 'HH:mm').getTime()).toBe(23 * Time.Hour + 59 * Time.Minute)
    expect(Time.utc('24:00', 'HH:mm').getTime()).toBe(Time.Day)
  })

  test(`parse date input`, () => {
    expect(Time.utc('2020-02-20', 'YYYY-MM-DD').toJSON()).toBe(`2020-02-20T00:00:00.000Z`)
  })

  test(`combine date input and time input`, () => {
    const time = Time.utc('23:59', Time.Formats.InputTime).getTime()
    const date = Time.utc('2020-02-20', Time.Formats.InputDate).getTime()
    expect(new Date(date + time).toJSON()).toBe(`2020-02-20T23:59:00.000Z`)
  })

  test(`helper for apis`, () => {
    expect(Time.date()).toBe(null)
    expect(Time.date(undefined)).toBe(null)
    expect(Time.date(null)).toBe(null)

    const date = new Date('2020-02-20T23:59:00.000Z')
    expect(Time.date(date)).toBe(date)
    expect(Time.date(date.toJSON())).toEqual(date)
    expect(Time.date(date.getTime())).toEqual(date)
    expect(Time.date(Time(date.getTime()))).toEqual(date)
    expect(Time.date(Time.utc(date.getTime()))).toEqual(date)
  })
})

describe('abbreviateTimeDifference', () => {
  const now = new Date('2022-03-18')
  jest.useFakeTimers().setSystemTime(now)

  it('simplifies seconds', () => {
    expect(abbreviateTimeDifference(Time(now).subtract(2, 'seconds').fromNow())).toStrictEqual('seconds ago')
    expect(abbreviateTimeDifference(Time(now).subtract(30, 'seconds').fromNow())).toStrictEqual('seconds ago')
    expect(abbreviateTimeDifference(Time(now).subtract(45, 'seconds').fromNow())).toStrictEqual('1m ago')
  })

  it('simplifies minutes', () => {
    expect(abbreviateTimeDifference(Time(now).subtract(1, 'minute').fromNow())).toStrictEqual('1m ago')
    expect(abbreviateTimeDifference(Time(now).subtract(5, 'minutes').fromNow())).toStrictEqual('5m ago')
    expect(abbreviateTimeDifference(Time(now).subtract(45, 'minutes').fromNow())).toStrictEqual('1h ago')
  })

  it('simplifies hours', () => {
    expect(abbreviateTimeDifference(Time(now).subtract(1, 'hours').fromNow())).toStrictEqual('1h ago')
    expect(abbreviateTimeDifference(Time(now).subtract(6, 'hours').fromNow())).toStrictEqual('6h ago')
    expect(abbreviateTimeDifference(Time(now).subtract(12, 'hours').fromNow())).toStrictEqual('12h ago')
    expect(abbreviateTimeDifference(Time(now).subtract(23, 'hours').fromNow())).toStrictEqual('1d ago')
    expect(abbreviateTimeDifference(Time(now).subtract(24, 'hours').fromNow())).toStrictEqual('1d ago')
  })

  it('simplifies days', () => {
    expect(abbreviateTimeDifference(Time(now).subtract(1, 'days').fromNow())).toStrictEqual('1d ago')
    expect(abbreviateTimeDifference(Time(now).subtract(6, 'days').fromNow())).toStrictEqual('6d ago')
    expect(abbreviateTimeDifference(Time(now).subtract(7, 'days').fromNow())).toStrictEqual('7d ago')
    expect(abbreviateTimeDifference(Time(now).subtract(8, 'days').fromNow())).toStrictEqual('8d ago')
    expect(abbreviateTimeDifference(Time(now).subtract(14, 'days').fromNow())).toStrictEqual('14d ago')
    expect(abbreviateTimeDifference(Time(now).subtract(15, 'days').fromNow())).toStrictEqual('15d ago')
    expect(abbreviateTimeDifference(Time(now).subtract(30, 'days').fromNow())).toStrictEqual('1mo ago')
    expect(abbreviateTimeDifference(Time(now).subtract(90, 'days').fromNow())).toStrictEqual('3mo ago')
    expect(abbreviateTimeDifference(Time(now).subtract(360, 'days').fromNow())).toStrictEqual('1y ago')
    expect(abbreviateTimeDifference(Time(now).subtract(365, 'days').fromNow())).toStrictEqual('1y ago')
  })

  it('simplifies weeks', () => {
    expect(abbreviateTimeDifference(Time(now).subtract(2, 'weeks').fromNow())).toStrictEqual('14d ago')
  })

  it('simplifies months', () => {
    expect(abbreviateTimeDifference(Time(now).subtract(1, 'month').fromNow())).toStrictEqual('1mo ago')
    expect(abbreviateTimeDifference(Time(now).subtract(10, 'month').fromNow())).toStrictEqual('10mo ago')
    expect(abbreviateTimeDifference(Time(now).subtract(11, 'month').fromNow())).toStrictEqual('1y ago')
    expect(abbreviateTimeDifference(Time(now).subtract(12, 'month').fromNow())).toStrictEqual('1y ago')
  })

  it('simplifies years', () => {
    expect(abbreviateTimeDifference(Time(now).subtract(1, 'year').fromNow())).toStrictEqual('1y ago')
    expect(abbreviateTimeDifference(Time(now).subtract(10, 'years').fromNow())).toStrictEqual('10y ago')
  })
})
