import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import React from 'react'
import './VotingPowerDistribution.css'

interface Props {
  mana: number
  name: number
  land: number
  delegated: number
}

const VotingPowerDistribution = ({ mana, name, land, delegated }: Props) => {
  const t = useFormatMessage()
  const total = mana + name + land + delegated

  return (
    <>
      <div
        className={TokenList.join(['VotingPowerDistributionBar', total <= 0 && 'VotingPowerDistributionBar--Empty'])}
      >
        {mana > 0 && (
          <div
            className="VotingPowerDistributionBar__Item VotingPowerDistribution__Mana"
            style={{ width: `${(mana * 100) / total}%` }}
          />
        )}
        {name > 0 && (
          <div
            className="VotingPowerDistributionBar__Item VotingPowerDistribution__Name"
            style={{ width: `${(name * 100) / total}%` }}
          />
        )}
        {land > 0 && (
          <div
            className="VotingPowerDistributionBar__Item VotingPowerDistribution__Land"
            style={{ width: `${(land * 100) / total}%` }}
          />
        )}
        {delegated > 0 && (
          <div
            className="VotingPowerDistributionBar__Item VotingPowerDistribution__Delegated"
            style={{ width: `${(delegated * 100) / total}%` }}
          />
        )}
      </div>
      <div className="VotingPowerDistribution__Labels">
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Mana" />
          {t('modal.vp_delegation_detail.stats_bar_mana')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Land" />
          {t('modal.vp_delegation_detail.stats_bar_land')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Name" />
          {t('modal.vp_delegation_detail.stats_bar_name')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Delegated" />
          {t('modal.vp_delegation_detail.stats_bar_delegated')}
        </div>
      </div>
    </>
  )
}

export default VotingPowerDistribution
