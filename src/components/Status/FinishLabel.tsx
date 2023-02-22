import React, { useMemo } from 'react'

import useCountdown, { Countdown } from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import DateTooltip from '../Common/DateTooltip'

import './FinishLabel.css'

export type FinishLabelProps = {
  date: Date
}

function getTimeLabel(timeout: Countdown, time: Time.Dayjs, format?: 'short') {
  return timeout.time > 0 ? time.fromNow() : format === 'short' ? time.format('MM/DD/YY') : time.format('MMM DD, YYYY')
}

export default React.memo(function FinishLabel({ date }: FinishLabelProps) {
  const time = useMemo(() => Time.from(date), [date])
  const timeout = useCountdown(date)
  const t = useFormatMessage()
  const label =
    timeout.time > 0 ? `${t('page.proposal_list.finish_label.ends')}` : `${t('page.proposal_list.finish_label.ended')}`

  return (
    <>
      <Mobile>
        <span className="FinishLabel">
          <DateTooltip date={date}>{`${label} ${getTimeLabel(timeout, time, 'short')}`}</DateTooltip>
        </span>
      </Mobile>
      <NotMobile>
        <span className="FinishLabel">
          <DateTooltip date={date}>{`${label} ${getTimeLabel(timeout, time)}`}</DateTooltip>
        </span>
      </NotMobile>
    </>
  )
})
