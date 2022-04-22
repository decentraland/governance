import React from 'react'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

const Date = ({ children, date }: { children: React.ReactNode; date: Date }) => {
  return (
    <time dateTime={String(date)} title={Time(date).format('MM/DD/YYYY, HH:mm:ss')}>
      {children}
    </time>
  )
}

export default Date
