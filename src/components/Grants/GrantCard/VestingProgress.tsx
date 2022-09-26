import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { GrantAttributes } from '../../../entities/Proposal/types'
import '../../Modal/VotingPowerDelegationDetail/VotingPowerDistribution.css'

import PercentageLabel from './PercentageLabel'
import './VestingProgress.css'

export type Props = React.HTMLAttributes<HTMLDivElement> & {
  grant: GrantAttributes
  basic?: boolean
}

const getRoundedPercentage = (value: number, total: number) => Math.min(Math.round((value * 100) / total), 100)

const VestingProgress = ({ grant, basic }: Props) => {
  const t = useFormatMessage()
  const { contract, enacting_tx, tx_amount, token, enacted_at } = grant
  const total = contract?.vesting_total_amount || 100
  const vestedPercentage = contract ? getRoundedPercentage(contract.vestedAmount, total) : 100
  const releasedPercentage = contract ? getRoundedPercentage(contract.released, total) : null
  const vestedAmountText = `${t(`general.number`, {
    value: contract ? contract.vestedAmount : tx_amount || 0,
  })} ${token?.symbol}`
  const releasedText = contract
    ? `${t(`general.number`, { value: contract.released })} ${token?.symbol} ${t('page.grants.released')}`
    : t('page.grants.one_time_payment')
  const enactedDate = Time.unix(enacted_at).fromNow()

  return (
    <div className="VestingProgress">
      {!basic && (
        <div className="VestingProgress__Labels">
          <div className="VestingProgress__VestedInfo">
            <span className="VestingProgress__Bold VestingProgress__Ellipsis">{vestedAmountText}</span>
            <span className="VestingProgress__Ellipsis">
              {enacting_tx ? t('page.grants.transferred') : t('page.grants.vested')}
            </span>
            <PercentageLabel percentage={vestedPercentage} color={enacting_tx ? 'Fuchsia' : 'Yellow'} />
          </div>
          <div className="VestingProgress__ReleasedInfo VestingProgress__Ellipsis">
            {contract && <div className="VestingProgress__ReleasedInfoLabel" />}
            <span
              className={TokenList.join(['VestingProgress__Ellipsis', !contract && 'VestingProgressBar__LightText'])}
            >
              {releasedText}
            </span>
          </div>
        </div>
      )}

      <div className="VestingProgressBar">
        {!!(releasedPercentage && releasedPercentage > 0) && (
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

      {!basic && (
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
      )}
    </div>
  )
}

export default VestingProgress
