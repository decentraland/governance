import React, { useMemo } from 'react'

import useCountdown, { Countdown } from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import DateTooltip from '../Common/DateTooltip'

import './FinishLabel.css'

interface Props {
  startAt: Date
  finishAt: Date
}

function getTimeLabel(timeout: Countdown, time: Time.Dayjs, format?: 'short') {
  return timeout.time > 0 ? time.fromNow() : format === 'short' ? time.format('MM/DD/YY') : time.format('MMM DD, YYYY')
}

export default function FinishLabel({ startAt, finishAt }: Props) {
  const time = useMemo(() => Time.from(finishAt), [finishAt])
  const timeout = useCountdown(finishAt)
  const t = useFormatMessage()
  const isCountdownRunning = timeout.time > 0
  const hasStarted = Time().isBefore(startAt)
  const tooltipDate = hasStarted ? startAt : finishAt
  const endLabel = isCountdownRunning
    ? `${t('page.proposal_list.finish_label.ends')} `
    : `${t('page.proposal_list.finish_label.ended')} `
  const label = hasStarted ? `${t('page.proposal_list.finish_label.starts')} ` : endLabel

  return (
    <span className="FinishLabel">
      <Mobile>
        <DateTooltip date={tooltipDate}>{`${label} ${getTimeLabel(timeout, time, 'short')}`}</DateTooltip>
      </Mobile>
      <NotMobile>
        <DateTooltip date={tooltipDate}>{`${label} ${getTimeLabel(timeout, time)}`}</DateTooltip>
      </NotMobile>
    </span>
  )
}
