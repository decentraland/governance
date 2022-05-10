import React from 'react'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

Time.extend(LocalizedFormat)

const Date = ({ children, date }: { children: React.ReactNode; date: Date }) => {
  return (
    <time dateTime={String(date)} title={Time.utc(date).format('LLL')}>
      {children}
    </time>
  )
}

export default Date
