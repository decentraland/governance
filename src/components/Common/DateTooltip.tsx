import React from 'react'

import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

Time.extend(LocalizedFormat)

const DateTooltip = ({ children, date }: { children: React.ReactNode; date: Date }) => {
  return (
    <>
      <Mobile>
        <time dateTime={String(date)} title={Time(date).format('l')}>
          {children}
        </time>
      </Mobile>
      <NotMobile>
        <time dateTime={String(date)} title={Time(date).format('LLL')}>
          {children}
        </time>
      </NotMobile>
    </>
  )
}

export default DateTooltip
