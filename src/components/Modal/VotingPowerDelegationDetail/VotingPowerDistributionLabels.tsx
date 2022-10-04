import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { VpDistribution } from '../../../clients/SnapshotGraphqlTypes'
import { getPercentage } from '../../../helpers'
import { EMPTY_DISTRIBUTION } from '../../../hooks/useVotingPowerDistribution'
import MobileSlider from '../../Common/MobileSlider'

import VotingPowerDistributionLabel from './VotingPowerDistributionLabel'

interface Props {
  vpDistribution: VpDistribution | null
}

const VotingPowerDistributionLabels = ({ vpDistribution }: Props) => {
  const t = useFormatMessage()
  const { total, mana, names, land, delegated, estate, linkedWearables } = vpDistribution || EMPTY_DISTRIBUTION

  return (
    <MobileSlider containerClassName="VotingPowerDistribution__Labels">
      <VotingPowerDistributionLabel
        labelText={t('modal.vp_delegation.details.stats_bar_mana')}
        tooltipText={t('modal.vp_delegation.details.stats_bar_mana_info')}
        subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
          amount: mana,
          percentage: getPercentage(mana, total, 0),
        })}
        className={'VotingPowerDistribution__Mana'}
      />
      <VotingPowerDistributionLabel
        labelText={t('modal.vp_delegation.details.stats_bar_name')}
        tooltipText={t('modal.vp_delegation.details.stats_bar_name_info')}
        subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
          amount: names,
          percentage: getPercentage(names, total, 0),
        })}
        className={'VotingPowerDistribution__Name'}
      />
      <VotingPowerDistributionLabel
        labelText={t('modal.vp_delegation.details.stats_bar_linked_wearables')}
        tooltipText={t('modal.vp_delegation.details.stats_bar_linked_wearables_info')}
        subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
          amount: linkedWearables,
          percentage: getPercentage(linkedWearables, total, 0),
        })}
        className={'VotingPowerDistribution__LinkedWearables'}
      />
      <VotingPowerDistributionLabel
        labelText={t('modal.vp_delegation.details.stats_bar_land')}
        tooltipText={t('modal.vp_delegation.details.stats_bar_land_info')}
        subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
          amount: land,
          percentage: getPercentage(land, total, 0),
        })}
        className={'VotingPowerDistribution__Land'}
      />
      <VotingPowerDistributionLabel
        labelText={t('modal.vp_delegation.details.stats_bar_estates')}
        tooltipText={t('modal.vp_delegation.details.stats_bar_estates_info')}
        subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
          amount: estate,
          percentage: getPercentage(estate, total, 0),
        })}
        className={'VotingPowerDistribution__Estate'}
      />
      <VotingPowerDistributionLabel
        labelText={t('modal.vp_delegation.details.stats_bar_delegated')}
        tooltipText={t('modal.vp_delegation.details.stats_bar_delegated_info')}
        subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
          amount: delegated,
          percentage: getPercentage(delegated, total, 0),
        })}
        className={'VotingPowerDistribution__Delegated'}
      />
    </MobileSlider>
  )
}

export default VotingPowerDistributionLabels
