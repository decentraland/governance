import Skeleton from 'react-loading-skeleton'

import classNames from 'classnames'

import { VpDistribution } from '../../../clients/SnapshotTypes'
import useFormatMessage from '../../../hooks/useFormatMessage'
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
  const { total, mana, names, land, delegated, estate, l1Wearables, rental } = vpDistribution || EMPTY_DISTRIBUTION

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className={classNames('VotingPowerDistributionBar', 'VotingPowerDistributionBar__Loading')} />
        <VotingPowerDistributionLabels vpDistribution={vpDistribution} />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={classNames('VotingPowerDistributionBar', total <= 0 && 'VotingPowerDistributionBar--Empty')}>
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
          value={l1Wearables}
          total={total}
          label={t('modal.vp_delegation.details.stats_l1_wearables')}
          className={'VotingPowerDistribution__L1Wearables'}
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
        <VotingPowerDistributionBarWithPopup
          value={rental}
          total={total}
          label={t('modal.vp_delegation.details.stats_rental')}
          className={'VotingPowerDistribution__Rental'}
        />
      </div>
      <VotingPowerDistributionLabels vpDistribution={vpDistribution} />
    </div>
  )
}

export default VotingPowerDistribution
