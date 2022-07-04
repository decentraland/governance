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
  const { contract, enacting_tx, enacting_token, enacted_at } = grant

  const total = contract ? contract.balance : 100
  const vestedPercentage = contract ? Math.min(Math.round((contract.vestedAmount * 100) / total), 100) : 100
  const releasedPercentage = contract ? Math.min(Math.round((contract.released * 100) / total), 100) : null

  return (
    <div className="VestingProgress">
      <div className="VestingProgress__Labels">
        <div className="VestingProgress__VestedInfo">
          <span className="VestingProgress__Bold VestingProgress__Ellipsis">
            {t(`general.number`, { value: contract?.vestedAmount || 100 }) + ' ' + (contract?.symbol || enacting_token)}
          </span>
          <span className="VestingProgress__Ellipsis">{enacting_tx ? 'transferred' : 'vested'}</span>
          <PercentageLabel percentage={vestedPercentage} color={enacting_tx ? 'Fuchsia' : 'Yellow'} />
        </div>
        {contract && (
          <div className="VestingProgress__ReleasedInfo VestingProgress__Ellipsis">
            <div className="VestingProgress__ReleasedInfoLabel" />
            <span className="VestingProgress__Ellipsis">
              {t(`general.number`, { value: contract.released }) + ' ' + contract.symbol + ' released'}
            </span>
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
        {enacting_tx && (
          <div className="VestingProgressBar__Item VestingProgressBar__Transferred" style={{ width: '100%' }} />
        )}
      </div>

      <div className="VestingProgress__VestedAt">
        <span>{enacting_tx ? 'Transaction made' : 'Started'}</span>
        <span className="VestingProgress__VestedDate">
          {contract ? Time.unix(enacted_at as number).fromNow() : Time().subtract(1, 'week').fromNow()}
        </span>
      </div>
    </div>
  )
}

export default VestingProgress
