import React, { useMemo } from 'react'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import './FinishLabel.css'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

const clock = require('../../images/icons/time.svg')

export type FinishLabelProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  date: Date
}

export default React.memo(function FinishLabel({ date, ...props }: FinishLabelProps) {
  const time = useMemo(() => Time.from(date), [ date ])
  const timeout = useCountdown(date)

  if (timeout.time === 0) {
    return null
  }

  return <div
    {...props}
    className={TokenList.join([
      `FinishLabel`,
    ])}
  >
    <img src={clock} width="24" height="24" />
    <span>Ends {time.fromNow()}</span>
  </div>
})