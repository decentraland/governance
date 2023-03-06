import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { getFormattedPercentage } from '../../../../helpers'
import VotingPowerDistributionPopup from '../../../Modal/VotingPowerDelegationDetail/VotingPowerDistributionPopup'

import './DistributionBarItem.css'

interface Props {
  value: number
  total: number
  label: string
  style: string
  selected?: boolean
}

const DistributionBarItem = ({ value, style, selected, label, total }: Props) => {
  const valuePercentage = getFormattedPercentage(value, total)
  return (
    <>
      {value > 0 && (
        <VotingPowerDistributionPopup amount={value} percentage={valuePercentage} label={label}>
          <div
            className={TokenList.join(['DistributionBarItem', !!selected && 'DistributionBarItem__Selected', style])}
            style={{ width: valuePercentage }}
          />
        </VotingPowerDistributionPopup>
      )}
    </>
  )
}

export default DistributionBarItem
