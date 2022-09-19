import React from 'react'
import Skeleton from 'react-loading-skeleton'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { VpDistribution } from '../../../clients/SnapshotGraphql'
import { EMPTY_DISTRIBUTION } from '../../../hooks/useVotingPowerDistribution'
import HelperText from '../../Helper/HelperText'

import './VotingPowerDistribution.css'
import VotingPowerDistributionPopup from './VotingPowerDistributionPopup'

interface Props {
  vpDistribution: VpDistribution | null
  isLoading: boolean
  className?: string
}

const getPercentage = (value: number, total: number): string => `${((value * 100) / total).toFixed(2)}%`

const VotingPowerDistribution = ({ vpDistribution, isLoading, className }: Props) => {
  const t = useFormatMessage()
  const { total, mana, names, land, delegated, estate, linkedWearables } = vpDistribution || EMPTY_DISTRIBUTION
  const manaPercentage = getPercentage(mana, total)
  const namePercentage = getPercentage(names, total)
  const landPercentage = getPercentage(land, total)
  const delegatedPercentage = getPercentage(delegated, total)
  const estatesPercentage = getPercentage(estate, total)
  const linkedWearablesPercentage = getPercentage(linkedWearables, total)

  return (
    <div className={className}>
      {isLoading ? (
        <Skeleton className={TokenList.join(['VotingPowerDistributionBar', 'VotingPowerDistributionBar__Loading'])} />
      ) : (
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
          {linkedWearables > 0 && (
            <VotingPowerDistributionPopup
              amount={linkedWearables}
              percentage={linkedWearablesPercentage}
              label={t('modal.vp_delegation.details.stats_linked_wearables')}
            >
              <div
                className="VotingPowerDistributionBar__Item VotingPowerDistribution__LinkedWearables"
                style={{ width: linkedWearablesPercentage }}
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
      )}
      <div className="VotingPowerDistribution__Labels">
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Mana" />
          <HelperText
            labelText={t('modal.vp_delegation.details.stats_bar_mana')}
            tooltipText={t('modal.vp_delegation.details.stats_bar_mana_info')}
            position="bottom center"
          />
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Name" />
          <HelperText
            labelText={t('modal.vp_delegation.details.stats_bar_name')}
            tooltipText={t('modal.vp_delegation.details.stats_bar_mana_info')}
            position="bottom center"
          />
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__LinkedWearables" />
          <HelperText
            labelText={t('modal.vp_delegation.details.stats_bar_linked_wearables')}
            tooltipText={t('modal.vp_delegation.details.stats_bar_linked_wearables_info')}
            position="bottom center"
          />
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Land" />
          <HelperText
            labelText={t('modal.vp_delegation.details.stats_bar_land')}
            tooltipText={t('modal.vp_delegation.details.stats_bar_land_info')}
            position="bottom center"
          />
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Estate" />
          <HelperText
            labelText={t('modal.vp_delegation.details.stats_bar_estates')}
            tooltipText={t('modal.vp_delegation.details.stats_bar_estates_info')}
            position="bottom center"
          />
        </div>
        <div className="VotingPowerDistribution__Label">
          <div className="VotingPowerDistribution__Color VotingPowerDistribution__Delegated" />
          <HelperText
            labelText={t('modal.vp_delegation.details.stats_bar_delegated')}
            tooltipText={t('modal.vp_delegation.details.stats_bar_delegated_info')}
            position="bottom center"
          />
        </div>
      </div>
    </div>
  )
}

export default VotingPowerDistribution
