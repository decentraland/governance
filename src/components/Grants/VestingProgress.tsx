import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { GrantAttributes } from '../../entities/Proposal/types'
import '../Modal/VotingPowerDelegationDetail/VotingPowerDistribution.css'

import PercentageLabel from './PercentageLabel'
import './VestingProgress.css'

export type Props = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantAttributes
}

const VestingProgress = ({ grant }: Props) => {
  const t = useFormatMessage()
  const { contract, enacting_tx, token, enacted_at } = grant

  const total = contract ? contract.vesting_total_amount : 100
  const vestedPercentage = contract ? Math.min(Math.round((contract.vestedAmount * 100) / total), 100) : 100
  const releasedPercentage = contract ? Math.min(Math.round((contract.released * 100) / total), 100) : null
  const vestedAmountText = `${t(`general.number`, { value: contract?.vestedAmount || 100 })} ${token}`
  const releasedText = contract
    ? `${t(`general.number`, { value: contract.released })} ${token} ${t('page.grants.released')}`
    : null
  const enactedDate = Time.unix(enacted_at).fromNow()

  return (
    <div className="VestingProgress">
      <div className="VestingProgress__Labels">
        <div className="VestingProgress__VestedInfo">
          <span className="VestingProgress__Bold VestingProgress__Ellipsis">{vestedAmountText}</span>
          <span className="VestingProgress__Ellipsis">
            {enacting_tx ? t('page.grants.transferred') : t('page.grants.vested')}
          </span>
          <PercentageLabel percentage={vestedPercentage} color={enacting_tx ? 'Fuchsia' : 'Yellow'} />
        </div>
        {releasedText && (
          <div className="VestingProgress__ReleasedInfo VestingProgress__Ellipsis">
            <div className="VestingProgress__ReleasedInfoLabel" />
            <span className="VestingProgress__Ellipsis">{releasedText}</span>
          </div>
        )}
      </div>

      <div className="VestingProgressBar">
        {releasedPercentage && releasedPercentage > 0 && (
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
        {enacting_tx && <div className="VestingProgressBar__Item VestingProgressBar__Transferred" />}
      </div>

      <div className="VestingProgress__Dates">
        <div className="VestingProgress__VestedAt">
          <span>{enacting_tx ? t('page.grants.transaction_date') : t('page.grants.started_date')}</span>
          <span className="VestingProgress__VestedDate">{enactedDate}</span>
        </div>
        {contract?.finish_at && (
          <div className="VestingProgress__VestedAt">
            <span>{t('page.grants.end_date')}</span>
            <span className="VestingProgress__VestedDate">{Time.unix(contract.finish_at).fromNow()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default VestingProgress
