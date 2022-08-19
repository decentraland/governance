import React, { useMemo } from 'react'

import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import DateTooltip from '../Common/DateTooltip'

import './FinishLabel.css'

export type FinishLabelProps = {
  date: Date
}

export default React.memo(function FinishLabel({ date }: FinishLabelProps) {
  const time = useMemo(() => Time.from(date), [date])
  const timeout = useCountdown(date)
  const t = useFormatMessage()

  const label =
    timeout.time > 0
      ? `${t('page.proposal_list.finish_label.ends')} ${time.fromNow()}`
      : `${t('page.proposal_list.finish_label.ended')} ${time.format('MMM DD, YYYY')}`

  return (
    <span className="FinishLabel">
      <DateTooltip date={date}>{label}</DateTooltip>
    </span>
  )
})
