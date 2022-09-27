import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { VpDistribution } from '../../../clients/SnapshotGraphql'

import './VotingPowerDistribution.css'
import VotingPowerDistributionPopup from './VotingPowerDistributionPopup'

interface Props {
  vpDistribution: VpDistribution
  className?: string
}

const getPercentage = (value: number, total: number): string => `${((value * 100) / total).toFixed(2)}%`

const VotingPowerDistribution = ({ vpDistribution, className }: Props) => {
  const t = useFormatMessage()
  const { total, mana, names, land, delegated, estate, l1Wearables } = vpDistribution

  const manaPercentage = getPercentage(mana, total)
  const namePercentage = getPercentage(names, total)
  const landPercentage = getPercentage(land, total)
  const delegatedPercentage = getPercentage(delegated, total)
  const estatesPercentage = getPercentage(estate, total)
  const l1WearablesPercentage = getPercentage(l1Wearables, total)

  return (
    <div className={className}>
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
        {names > 0 && (
          <VotingPowerDistributionPopup
            amount={names}
            percentage={namePercentage}
            label={t('modal.vp_delegation.details.stats_name')}
          >
            <div
              className="VotingPowerDistributionBar__Item VotingPowerDistribution__Name"
              style={{ width: namePercentage }}
            />
          </VotingPowerDistributionPopup>
        )}
        {l1Wearables > 0 && (
          <VotingPowerDistributionPopup
            amount={l1Wearables}
            percentage={l1WearablesPercentage}
            label={t('modal.vp_delegation.details.stats_l1_wearables')}
          >
            <div
              className="VotingPowerDistributionBar__Item VotingPowerDistribution__L1Wearables"
              style={{ width: l1WearablesPercentage }}
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
        {estate > 0 && (
          <VotingPowerDistributionPopup
            amount={estate}
            percentage={estatesPercentage}
            label={t('modal.vp_delegation.details.stats_estate')}
          >
            <div
              className="VotingPowerDistributionBar__Item VotingPowerDistribution__Estate"
              style={{ width: estatesPercentage }}
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
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Name" />
          {t('modal.vp_delegation.details.stats_bar_name')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__L1Wearables" />
          {t('modal.vp_delegation.details.stats_bar_l1_wearables')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Land" />
          {t('modal.vp_delegation.details.stats_bar_land')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Estate" />
          {t('modal.vp_delegation.details.stats_bar_estates')}
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Delegated" />
          {t('modal.vp_delegation.details.stats_bar_delegated')}
        </div>
      </div>
    </div>
  )
}

export default VotingPowerDistribution
