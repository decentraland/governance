import React from 'react'
import Skeleton from 'react-loading-skeleton'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './DistributionBar.css'
import DistributionBarItem, { DistributionBarItemProps } from './DistributionBarItem'

interface Props {
  items: DistributionBarItemProps[]
  total: number
  isLoading?: boolean
  className?: string
  hidePopups: boolean
}

const DistributionBar = ({ items, total, isLoading, hidePopups, className }: Props) => {
  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className={TokenList.join(['DistributionBar', 'DistributionBar__Loading'])} />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={TokenList.join(['DistributionBar', total <= 0 && 'DistributionBar--empty'])}>
        {total > 0 &&
          items.map(({ value, popupContent, className, selected, onHover, onBlur }, index) => (
            <DistributionBarItem
              key={`distribution-bar-item-${index}`}
              value={value}
              total={total}
              popupContent={hidePopups ? undefined : popupContent}
              className={className}
              selected={selected}
              onHover={onHover}
              onBlur={onBlur}
            />
          ))}
      </div>
    </div>
  )
}

export default DistributionBar
