import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution.css'

import { VestingAttributes } from './GrantCard'
import PercentageLabel from './PercentageLabel'
import './VestingProgress.css'

export type Props = React.HTMLAttributes<HTMLDivElement> & {
  vesting: VestingAttributes
}

const VestingProgress = ({ vesting }: Props) => {
  const t = useFormatMessage()
  const total = vesting.total
  const vestedPercentage = Math.round((vesting.vested / total) * 100)
  const releasedPercentage = Math.round((vesting.released / total) * 100)
  const restPercentage = Math.round(100 - vestedPercentage - releasedPercentage)

  return (
    <div className="VestingProgress">
      <div className="VestingProgress__Labels">
        <div className="VestingProgress__VestedInfo">
          <span className="VestingProgress__Bold">
            {t(`general.number`, { value: vesting.vested }) + ' ' + vesting.token}
          </span>
          <span>{'vested'}</span>
          <PercentageLabel percentage={vestedPercentage} color="Yellow" />
        </div>
        <div className="VestingProgress__ReleasedInfo">
          <div className="VestingProgress__ReleasedInfoLabel" />
          <span>{t(`general.number`, { value: vesting.released }) + ' ' + vesting.token + ' released'}</span>
        </div>
      </div>

      <div className={TokenList.join(['VestingProgressBar', total <= 0 && 'VestingProgressBar--Empty'])}>
        <div
          className="VestingProgressBar__Item VestingProgressBar__Released"
          style={{ width: releasedPercentage + '%' }}
        />
        <div
          className="VestingProgressBar__Item VestingProgressBar__Vested"
          style={{ width: vestedPercentage + '%' }}
        />
        <div className="VestingProgressBar__Item VestingProgressBar__Rest" style={{ width: restPercentage + '%' }} />
      </div>

      <div className="VestingProgress__VestedAt">
        <span>{'Started'}</span>
        <span className="VestingProgress__VestedDate">{Time.unix(vesting.vested_at.getTime()).fromNow()}</span>
      </div>
    </div>
  )
}

export default VestingProgress
