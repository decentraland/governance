import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './VotingPowerDistribution.css'
import VotingPowerDistributionPopup from './VotingPowerDistributionPopup'

interface Props {
  mana: number
  name: number
  land: number
  delegated: number
}

const getPercentage = (value: number, total: number): string => `${((value * 100) / total).toFixed(2)}%`

const VotingPowerDistribution = ({ mana, name, land, delegated }: Props) => {
  const t = useFormatMessage()
  const total = mana + name + land + delegated
  const manaPercentage = getPercentage(mana, total)
  const namePercentage = getPercentage(name, total)
  const landPercentage = getPercentage(land, total)
  const delegatedPercentage = getPercentage(delegated, total)

  return (
    <>
      <div
        className={TokenList.join(['VotingPowerDistributionBar', total <= 0 && 'VotingPowerDistributionBar--Empty'])}
      >
        {mana > 0 && (
          <VotingPowerDistributionPopup
            amount={mana}
            percentage={manaPercentage}
            label={t('modal.vp_delegation.details.stats_mana')}
          >
            <div
              className="VotingPowerDistributionBar__Item VotingPowerDistribution__Mana"
              style={{ width: manaPercentage }}
            />
          </VotingPowerDistributionPopup>
        )}
        {name > 0 && (
          <VotingPowerDistributionPopup
            amount={name}
            percentage={namePercentage}
            label={t('modal.vp_delegation.details.stats_name')}
          >
            <div
              className="VotingPowerDistributionBar__Item VotingPowerDistribution__Name"
              style={{ width: namePercentage }}
            />
          </VotingPowerDistributionPopup>
        )}
        {land > 0 && (
          <VotingPowerDistributionPopup
            amount={land}
            percentage={landPercentage}
            label={t('modal.vp_delegation.details.stats_land')}
          >
            <div
              className="VotingPowerDistributionBar__Item VotingPowerDistribution__Land"
              style={{ width: landPercentage }}
            />
          </VotingPowerDistributionPopup>
        )}
        {delegated > 0 && (
          <VotingPowerDistributionPopup
            amount={delegated}
            percentage={delegatedPercentage}
            label={t('modal.vp_delegation.details.stats_delegated')}
          >
            <div
              className="VotingPowerDistributionBar__Item VotingPowerDistribution__Delegated"
              style={{ width: delegatedPercentage }}
            />
          </VotingPowerDistributionPopup>
        )}
      </div>
      <div className="VotingPowerDistribution__Labels">
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Mana" />
          {t('modal.vp_delegation.details.stats_bar_mana')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Land" />
          {t('modal.vp_delegation.details.stats_bar_land')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Name" />
          {t('modal.vp_delegation.details.stats_bar_name')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Delegated" />
          {t('modal.vp_delegation.details.stats_bar_delegated')}
        </div>
      </div>
    </>
  )
}

export default VotingPowerDistribution
