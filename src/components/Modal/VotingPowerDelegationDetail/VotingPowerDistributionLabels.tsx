import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import MobileSlider from '../../Common/MobileSlider'

import VotingPowerDistributionLabel from './VotingPowerDistributionLabel'

const VotingPowerDistributionLabels = () => {
  const t = useFormatMessage()

  return (
    <MobileSlider containerClassName="VotingPowerDistribution__Labels">
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
    </MobileSlider>
  )
}

export default VotingPowerDistributionLabels
