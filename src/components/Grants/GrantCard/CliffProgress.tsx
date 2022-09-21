import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { CLIFF_PERIOD_IN_DAYS } from '../../../entities/Proposal/utils'
import '../../Modal/VotingPowerDelegationDetail/VotingPowerDistribution.css'

import './CliffProgress.css'

export type Props = React.HTMLAttributes<HTMLDivElement> & {
  enactedAt: number
  basic?: boolean
}

const getRoundedPercentage = (value: number, total: number) => Math.min(Math.round((value * 100) / total), 100)

const CliffProgress = ({ enactedAt, basic }: Props) => {
  const t = useFormatMessage()
  const now = Time.utc()
  const vestingStartDate = Time.unix(enactedAt)
  const elapsedSinceVestingStarted = now.diff(vestingStartDate, 'day')
  const daysToGo = CLIFF_PERIOD_IN_DAYS - elapsedSinceVestingStarted
  const elapsedPercentage = getRoundedPercentage(elapsedSinceVestingStarted, CLIFF_PERIOD_IN_DAYS)
  const enactedDate = vestingStartDate.fromNow()

  return (
    <div className="CliffProgress">
      {!basic && (
        <div className="CliffProgress__Labels">
          <div className="CliffProgress__CliffDuration">
            <span className="CliffProgress__Bold">{t('page.grants.one_month_cliff')}</span>
          </div>
          <div className="CliffProgress__CliffRemaining">
            <span>{t('page.grants.cliff_remaining', { count: daysToGo })}</span>
          </div>
        </div>
      )}

      <div className="CliffProgressBar">
        {elapsedPercentage > 0 && (
          <div
            className="CliffProgressBar__Item CliffProgressBar__Elapsed"
            style={{ width: elapsedPercentage + '%' }}
          />
        )}
      </div>

      {!basic && (
        <div className="CliffProgress__Dates">
          <div className="CliffProgress__EnactedAt">
            <span>{t('page.grants.started_date')}</span>
            <span className="CliffProgress__EnactedDate">{enactedDate}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CliffProgress
