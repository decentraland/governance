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
  typeSnakeCase: string
  typePascaleCase: string
}

const VotingPowerDistributionLabels = ({ vpDistribution }: Props) => {
  const t = useFormatMessage()
  const { total, mana, names, land, delegated, estate, linkedWearables } = vpDistribution || EMPTY_DISTRIBUTION

  const DISTRIBUTION_PROPS: LabelProps[] = [
    { value: mana, typeSnakeCase: 'mana', typePascaleCase: 'Mana' },
    { value: names, typeSnakeCase: 'name', typePascaleCase: 'Name' },
    { value: linkedWearables, typeSnakeCase: 'linked_wearables', typePascaleCase: 'LinkedWearables' },
    { value: land, typeSnakeCase: 'land', typePascaleCase: 'Land' },
    { value: estate, typeSnakeCase: 'estates', typePascaleCase: 'Estate' },
    { value: delegated, typeSnakeCase: 'delegated', typePascaleCase: 'Delegated' },
  ]

  return (
    <MobileSlider containerClassName="VotingPowerDistribution__Labels">
      {DISTRIBUTION_PROPS.map(({ value, typeSnakeCase, typePascaleCase }) => (
        <>
          {value > 0 && (
            <VotingPowerDistributionLabel
              key={typeSnakeCase}
              labelText={t(`modal.vp_delegation.details.stats_bar_${typeSnakeCase}`)}
              tooltipText={t(`modal.vp_delegation.details.stats_bar_${typeSnakeCase}_info`)}
              subtitleText={t('modal.vp_delegation.details.stats_bar_full_label', {
                amount: value,
                percentage: getPercentage(value, total, 0),
              })}
              className={`VotingPowerDistribution__${typePascaleCase}`}
            />
          )}
        </>
      ))}
    </MobileSlider>
  )
}

export default VotingPowerDistributionLabels
