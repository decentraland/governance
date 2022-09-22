import React from 'react'
import Skeleton from 'react-loading-skeleton'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { VpDistribution } from '../../../clients/SnapshotGraphql'
import { EMPTY_DISTRIBUTION } from '../../../hooks/useVotingPowerDistribution'

import './VotingPowerDistribution.css'
import VotingPowerDistributionBarWithPopup from './VotingPowerDistributionBarWithPopup'
import VotingPowerDistributionLabel from './VotingPowerDistributionLabel'

interface Props {
  vpDistribution: VpDistribution | null
  isLoading: boolean
  className?: string
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
          <VotingPowerDistributionBarWithPopup
            value={mana}
            total={total}
            label={t('modal.vp_delegation.details.stats_mana')}
            className={'VotingPowerDistribution__Mana'}
          />
          <VotingPowerDistributionBarWithPopup
            value={names}
            total={total}
            label={t('modal.vp_delegation.details.stats_name')}
            className={'VotingPowerDistribution__Name'}
          />
          <VotingPowerDistributionBarWithPopup
            value={linkedWearables}
            total={total}
            label={t('modal.vp_delegation.details.stats_linked_wearables')}
            className={'VotingPowerDistribution__LinkedWearables'}
          />
          <VotingPowerDistributionBarWithPopup
            value={land}
            total={total}
            label={t('modal.vp_delegation.details.stats_land')}
            className={'VotingPowerDistribution__Land'}
          />
          <VotingPowerDistributionBarWithPopup
            value={estate}
            total={total}
            label={t('modal.vp_delegation.details.stats_estate')}
            className={'VotingPowerDistribution__Estate'}
          />
          <VotingPowerDistributionBarWithPopup
            value={delegated}
            total={total}
            label={t('modal.vp_delegation.details.stats_delegated')}
            className={'VotingPowerDistribution__Delegated'}
          />
        </div>
      )}
      <div className="VotingPowerDistribution__Labels">
        <VotingPowerDistributionLabel
          labelText={t('modal.vp_delegation.details.stats_bar_mana')}
          tooltipText={t('modal.vp_delegation.details.stats_bar_mana_info')}
          className={'VotingPowerDistribution__Mana'}
        />
        <VotingPowerDistributionLabel
          labelText={t('modal.vp_delegation.details.stats_bar_name')}
          tooltipText={t('modal.vp_delegation.details.stats_bar_name_info')}
          className={'VotingPowerDistribution__Name'}
        />
        <VotingPowerDistributionLabel
          labelText={t('modal.vp_delegation.details.stats_bar_linked_wearables')}
          tooltipText={t('modal.vp_delegation.details.stats_bar_linked_wearables_info')}
          className={'VotingPowerDistribution__LinkedWearables'}
        />
        <VotingPowerDistributionLabel
          labelText={t('modal.vp_delegation.details.stats_bar_land')}
          tooltipText={t('modal.vp_delegation.details.stats_bar_land_info')}
          className={'VotingPowerDistribution__Land'}
        />
        <VotingPowerDistributionLabel
          labelText={t('modal.vp_delegation.details.stats_bar_estates')}
          tooltipText={t('modal.vp_delegation.details.stats_bar_estates_info')}
          className={'VotingPowerDistribution__Estate'}
        />
        <VotingPowerDistributionLabel
          labelText={t('modal.vp_delegation.details.stats_bar_delegated')}
          tooltipText={t('modal.vp_delegation.details.stats_bar_delegated_info')}
          className={'VotingPowerDistribution__Delegated'}
        />
      </div>
    </div>
  )
}

export default VotingPowerDistribution
