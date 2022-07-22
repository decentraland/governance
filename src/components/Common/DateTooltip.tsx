import React from 'react'

import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

Time.extend(LocalizedFormat)

const DateTooltip = ({ children, date }: { children: React.ReactNode; date: Date }) => {
  return (
    <time dateTime={String(date)} title={Time(date).format('LLL')}>
      {children}
    </time>
  )
}

export default DateTooltip
