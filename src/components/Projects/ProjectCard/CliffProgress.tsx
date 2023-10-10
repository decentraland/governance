import { CLIFF_PERIOD_IN_DAYS } from '../../../entities/Proposal/utils'
import { getRoundedPercentage } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import '../../Modal/VotingPowerDelegationDetail/VotingPowerDistribution.css'

import './CliffProgress.css'

type Props = {
  enactedAt: number
  basic?: boolean
}

const CliffProgress = ({ enactedAt, basic }: Props) => {
  const t = useFormatMessage()
  const now = Time.utc()
  const vestingStartDate = Time.unix(enactedAt)
  const elapsedSinceVestingStarted = now.diff(vestingStartDate, 'day')
  const daysToGo = CLIFF_PERIOD_IN_DAYS - elapsedSinceVestingStarted
  const elapsedPercentage = getRoundedPercentage(elapsedSinceVestingStarted, CLIFF_PERIOD_IN_DAYS)
  const enactedDate = vestingStartDate.fromNow()
  const hasStarted = Time(vestingStartDate).isBefore(now)

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
            <span>{hasStarted ? t('page.grants.started_date') : t('page.grants.starts_date')}</span>
            <span className="CliffProgress__EnactedDate">{enactedDate}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CliffProgress
