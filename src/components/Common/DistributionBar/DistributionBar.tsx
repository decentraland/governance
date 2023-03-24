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
  showPopups?: boolean
}

const DistributionBar = ({ items, total, isLoading, showPopups = true, className }: Props) => {
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
          items.map((item, index) => (
            <DistributionBarItem
              key={`distribution-bar-item-${index}`}
              item={item}
              total={total}
              showPopup={showPopups}
            />
          ))}
      </div>
    </div>
  )
}

export default DistributionBar
