import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import useCountdown, { Countdown } from '../../hooks/useCountdown'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import DateTooltip from '../Common/DateTooltip'

import './FinishLabel.css'

interface Props {
  startAt: Date
  finishAt: Date
}

function getTimeLabel(timeout: Countdown, date: Date, format?: 'short') {
  const time = Time(date)

  return timeout.time > 0 ? time.fromNow() : format === 'short' ? time.format('MM/DD/YY') : time.format('MMM DD, YYYY')
}

export default function FinishLabel({ startAt, finishAt }: Props) {
  const timeout = useCountdown(finishAt)
  const t = useFormatMessage()
  const isCountdownRunning = timeout.time > 0
  const hasStarted = Time().isAfter(startAt)
  const endLabel = isCountdownRunning
    ? `${t('page.proposal_list.finish_label.ends')} `
    : `${t('page.proposal_list.finish_label.ended')} `
  const label = hasStarted ? endLabel : `${t('page.proposal_list.finish_label.starts')} `
  const time = hasStarted ? finishAt : startAt

  return (
    <span className="FinishLabel">
      <Mobile>
        <DateTooltip date={time}>{`${label} ${getTimeLabel(timeout, time, 'short')}`}</DateTooltip>
      </Mobile>
      <NotMobile>
        <DateTooltip date={time}>{`${label} ${getTimeLabel(timeout, time)}`}</DateTooltip>
      </NotMobile>
    </span>
  )
}
