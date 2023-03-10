import React from 'react'

import DistributionBarPopup, { DistributionBarPopupContent } from './DistributionBarPopup'
import HorizontalBar, { HorizontalBarProps } from './HorizontalBar'

export type DistributionBarItemProps = {
  popupContent?: DistributionBarPopupContent
} & HorizontalBarProps

const DistributionBarItem = ({ value, className, selected, total, popupContent }: DistributionBarItemProps) => {
  return (
    <>
      {value > 0 &&
        (popupContent ? (
          <DistributionBarPopup popupContent={popupContent}>
            <HorizontalBar value={value} total={total} className={className} selected={selected} />
          </DistributionBarPopup>
        ) : (
          <HorizontalBar value={value} total={total} className={className} selected={selected} />
        ))}
    </>
  )
}

export default DistributionBarItem
