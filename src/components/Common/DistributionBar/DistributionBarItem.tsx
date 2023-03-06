import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { getFormattedPercentage } from '../../../helpers'

import './DistributionBarItem.css'
import DistributionBarPopup, { DistributionBarPopupContent } from './DistributionBarPopup'

interface Props {
  value: number
  total: number
  style: string
  selected?: boolean
  popupContent?: DistributionBarPopupContent
}

const DistributionBarItem = ({ value, style, selected, popupContent, total }: Props) => {
  const valuePercentage = getFormattedPercentage(value, total)
  const distributionBar = (
    <div
      className={TokenList.join(['DistributionBarItem', !!selected && 'DistributionBarItem__Selected', style])}
      style={{ width: valuePercentage }}
    />
  )
  return (
    <>
      {value > 0 &&
        (popupContent ? (
          <DistributionBarPopup popupContent={popupContent}>{distributionBar}</DistributionBarPopup>
        ) : (
          distributionBar
        ))}
    </>
  )
}

export default DistributionBarItem
