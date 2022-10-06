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

interface LabelProps {
  value: number
  intlKey: string
  cssClassName: string
}

const VotingPowerDistributionLabels = ({ vpDistribution }: Props) => {
  const t = useFormatMessage()
  const { total, mana, names, land, delegated, estate, linkedWearables } = vpDistribution || EMPTY_DISTRIBUTION

  const DISTRIBUTION_PROPS: LabelProps[] = [
    { value: mana, intlKey: 'mana', cssClassName: 'Mana' },
    { value: names, intlKey: 'name', cssClassName: 'Name' },
    { value: linkedWearables, intlKey: 'linked_wearables', cssClassName: 'LinkedWearables' },
    { value: land, intlKey: 'land', cssClassName: 'Land' },
    { value: estate, intlKey: 'estates', cssClassName: 'Estate' },
    { value: delegated, intlKey: 'delegated', cssClassName: 'Delegated' },
  ]

  return (
    <MobileSlider containerClassName="VotingPowerDistribution__Labels">
      {DISTRIBUTION_PROPS.map(({ value, intlKey, cssClassName }) => (
        <div key={intlKey}>
          {value > 0 && (
            <VotingPowerDistributionLabel
              labelText={t(`modal.vp_delegation.details.stats_bar_${intlKey}`)}
              tooltipText={t(`modal.vp_delegation.details.stats_bar_${intlKey}_info`)}
              subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
                amount: value,
                percentage: getPercentage(value, total, 0),
              })}
              className={`VotingPowerDistribution__${cssClassName}`}
            />
          )}
        </div>
      ))}
    </MobileSlider>
  )
}

export default VotingPowerDistributionLabels
