import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution.css'

import { VestingAttributes } from './GrantCard'
import PercentageLabel from './PercentageLabel'
import './VestingProgress.css'

export type Props = React.HTMLAttributes<HTMLDivElement> & {
  vesting: VestingAttributes
}

const VestingProgress = ({ vesting }: Props) => {
  const t = useFormatMessage()
  const total = vesting.balance + vesting.released
  const vestedPercentage = Math.round((vesting.vestedAmount / total) * 100)
  const releasedPercentage = Math.round((vesting.released / total) * 100)

  return (
    <div className="VestingProgress">
      <div className="VestingProgress__Labels">
        <div className="VestingProgress__VestedInfo">
          <span className="VestingProgress__Bold">
            {t(`general.number`, { value: vesting.vestedAmount }) + ' ' + vesting.symbol}
          </span>
          <span>{'vested'}</span>
          <PercentageLabel percentage={vestedPercentage} color="Yellow" />
        </div>
        <div className="VestingProgress__ReleasedInfo">
          <div className="VestingProgress__ReleasedInfoLabel" />
          <span>{t(`general.number`, { value: vesting.released }) + ' ' + vesting.symbol + ' released'}</span>
        </div>
      </div>

      <div className="VestingProgressBar">
        {releasedPercentage > 0 && (
          <div
            className="VestingProgressBar__Item VestingProgressBar__Released"
            style={{ width: releasedPercentage + '%' }}
          />
        )}
        {vestedPercentage > 0 && (
          <div
            className="VestingProgressBar__Item VestingProgressBar__Vested"
            style={{ width: vestedPercentage + '%' }}
          />
        )}
      </div>

      <div className="VestingProgress__VestedAt">
        <span>{'Started'}</span>
        <span className="VestingProgress__VestedDate">{Time.unix(vesting.start).fromNow()}</span>
      </div>
    </div>
  )
}

export default VestingProgress
