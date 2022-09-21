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

function getVpDistributionPopup(value: number, total: number, label: string, className: string) {
  const valuePercentage = getPercentage(value, total)
  return (
    <>
      {value > 0 && (
        <VotingPowerDistributionPopup amount={value} percentage={valuePercentage} label={label}>
          <div
            className={TokenList.join(['VotingPowerDistributionBar__Item', className])}
            style={{ width: valuePercentage }}
          />
        </VotingPowerDistributionPopup>
      )}
    </>
  )
}

function getVpDistributionLabel(labelText: string, tooltipText: string, className: string) {
  return (
    <div className="VotingPowerDistribution__Label">
      <div className={TokenList.join(['VotingPowerDistribution__Color', className])} />
      <HelperText labelText={labelText} tooltipText={tooltipText} position="bottom center" />
    </div>
  )
}

const VotingPowerDistribution = ({ vpDistribution, isLoading, className }: Props) => {
  const t = useFormatMessage()
  const { total, mana, names, land, delegated, estate, linkedWearables } = vpDistribution || EMPTY_DISTRIBUTION

  return (
    <div className={className}>
      {isLoading ? (
        <Skeleton className={TokenList.join(['VotingPowerDistributionBar', 'VotingPowerDistributionBar__Loading'])} />
      ) : (
        <div
          className={TokenList.join(['VotingPowerDistributionBar', total <= 0 && 'VotingPowerDistributionBar--Empty'])}
        >
          {getVpDistributionPopup(
            mana,
            total,
            t('modal.vp_delegation.details.stats_mana'),
            'VotingPowerDistribution__Mana'
          )}
          {getVpDistributionPopup(
            names,
            total,
            t('modal.vp_delegation.details.stats_name'),
            'VotingPowerDistribution__Name'
          )}
          {getVpDistributionPopup(
            linkedWearables,
            total,
            t('modal.vp_delegation.details.stats_linked_wearables'),
            'VotingPowerDistribution__LinkedWearables'
          )}
          {getVpDistributionPopup(
            land,
            total,
            t('modal.vp_delegation.details.stats_land'),
            'VotingPowerDistribution__Land'
          )}
          {getVpDistributionPopup(
            estate,
            total,
            t('modal.vp_delegation.details.stats_estate'),
            'VotingPowerDistribution__Estate'
          )}
          {getVpDistributionPopup(
            delegated,
            total,
            t('modal.vp_delegation.details.stats_delegated'),
            'VotingPowerDistribution__Delegated'
          )}
        </div>
      )}
      <div className="VotingPowerDistribution__Labels">
        {getVpDistributionLabel(
          t('modal.vp_delegation.details.stats_bar_mana'),
          t('modal.vp_delegation.details.stats_bar_mana_info'),
          'VotingPowerDistribution__Mana'
        )}
        {getVpDistributionLabel(
          t('modal.vp_delegation.details.stats_bar_name'),
          t('modal.vp_delegation.details.stats_bar_name_info'),
          'VotingPowerDistribution__Name'
        )}
        {getVpDistributionLabel(
          t('modal.vp_delegation.details.stats_bar_linked_wearables'),
          t('modal.vp_delegation.details.stats_bar_linked_wearables_info'),
          'VotingPowerDistribution__LinkedWearables'
        )}
        {getVpDistributionLabel(
          t('modal.vp_delegation.details.stats_bar_land'),
          t('modal.vp_delegation.details.stats_bar_land_info'),
          'VotingPowerDistribution__Land'
        )}
        {getVpDistributionLabel(
          t('modal.vp_delegation.details.stats_bar_estates'),
          t('modal.vp_delegation.details.stats_bar_estates_info'),
          'VotingPowerDistribution__Estate'
        )}
        {getVpDistributionLabel(
          t('modal.vp_delegation.details.stats_bar_delegated'),
          t('modal.vp_delegation.details.stats_bar_delegated_info'),
          'VotingPowerDistribution__Delegated'
        )}
      </div>
    </div>
  )
}

export default VotingPowerDistribution
