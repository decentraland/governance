import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { abbreviateTimeDifference } from './time'

const now = new Date('2022-03-18')
jest.useFakeTimers('modern').setSystemTime(now)

describe('abbreviateTimeDifference', () => {
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
