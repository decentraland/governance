/* eslint-disable @typescript-eslint/no-explicit-any */
import Time from 'dayjs'
import preciseDiff from 'dayjs-precise-range'
import duration from 'dayjs/plugin/duration'
import 'dayjs/plugin/duration'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import 'dayjs/plugin/isSameOrBefore'
import pluralGetSet from 'dayjs/plugin/pluralGetSet'
import 'dayjs/plugin/pluralGetSet'
import 'dayjs/plugin/quarterOfYear'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/plugin/utc'

import './plugin'

Time.extend(preciseDiff)
Time.extend(utc)
Time.extend(isSameOrAfter)
Time.extend(isSameOrBefore)
Time.extend(pluralGetSet)
Time.extend(relativeTime)
Time.extend(timezone)
Time.extend(quarterOfYear)
Time.extend(duration)
Time.extend((_options, Dayjs, factory) => {
  const Constants = {
    Millisecond: 1,
    Second: 1000 /* milliseconds */,
    Minute: 1000 /* milliseconds */ * 60 /* seconds */,
    Hour: 1000 /* milliseconds */ * 60 /* seconds */ * 60 /* minutes */,
    Day: 1000 /* milliseconds */ * 60 /* seconds */ * 60 /* minutes */ * 24 /* hours */,
    Week: 1000 /* milliseconds */ * 60 /* seconds */ * 60 /* minutes */ * 24 /* hours */ * 7 /* days */,
  }

  const Formats = Object.freeze({
    GoogleCalendar: 'YYYYMMDDTHHmmss[Z]',
    InputDate: 'YYYY-MM-DD',
    InputTime: 'HH:mm',
  })

  function date(value?: null | number | string | Date | Time.Dayjs) {
    if (value === null || value === undefined) {
      return null
    }

    if (value instanceof Date) {
      return value
    }

    return Time(value).toDate()
  }

  Object.assign(factory, Constants, {
    Formats,
    isTime: factory.isDayjs,
    date,
    from: factory,
  })

  const parse = (Dayjs.prototype as any).parse
  Object.assign(Dayjs.prototype, {
    parse: function (cfg: any) {
      if (typeof cfg.date === 'string' && typeof cfg.args[0] === 'string' && cfg.args[1] === Formats.InputTime) {
        cfg.date = '1970-01-01 ' + cfg.date
        cfg.utc = true
        cfg.args[0] = cfg.date
        cfg.args[1] = Formats.InputDate + ' ' + Formats.InputTime
      }

      parse.bind(this)(cfg)
    },
  })

  Dayjs.prototype.getTime = function timeGetTime() {
    return this.toDate().getTime()
  }

  Dayjs.prototype.toJSON = function timeToJSON() {
    return this.toDate().toJSON()
  }
})

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

export default Time
