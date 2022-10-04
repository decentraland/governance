import React from 'react'
import Skeleton from 'react-loading-skeleton'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { VpDistribution } from '../../../clients/SnapshotGraphqlTypes'
import { EMPTY_DISTRIBUTION } from '../../../hooks/useVotingPowerDistribution'

import './VotingPowerDistribution.css'
import VotingPowerDistributionBarWithPopup from './VotingPowerDistributionBarWithPopup'
import VotingPowerDistributionLabels from './VotingPowerDistributionLabels'

interface Props {
  vpDistribution: VpDistribution | null
  isLoading: boolean
  className?: string
}

const VotingPowerDistribution = ({ vpDistribution, isLoading, className }: Props) => {
  const t = useFormatMessage()
  const { total, mana, names, land, delegated, estate, linkedWearables } = vpDistribution || EMPTY_DISTRIBUTION

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className={TokenList.join(['VotingPowerDistributionBar', 'VotingPowerDistributionBar__Loading'])} />
        <VotingPowerDistributionLabels vpDistribution={vpDistribution} />
      </div>
    )
  }

  return (
    <div className={className}>
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
      <VotingPowerDistributionLabels vpDistribution={vpDistribution} />
    </div>
  )
}

export default VotingPowerDistribution
