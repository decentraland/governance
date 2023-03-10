import React from 'react'
import Skeleton from 'react-loading-skeleton'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './DistributionBar.css'
import DistributionBarItem from './DistributionBarItem'
import { DistributionBarPopupContent } from './DistributionBarPopup'

export interface DistributionItemProps {
  value: number
  className: string
  popupContent?: DistributionBarPopupContent
  selected?: boolean
}

interface Props {
  items: DistributionItemProps[]
  total: number
  isLoading?: boolean
  className?: string
}

const DistributionBar = ({ items, total, isLoading, className }: Props) => {
  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className={TokenList.join(['DistributionBar', 'DistributionBar__Loading'])} />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={TokenList.join(['DistributionBar', total <= 0 && 'DistributionBar--Empty'])}>
        {total > 0 &&
          items.map((item, index) => (
            <DistributionBarItem
              value={item.value}
              total={total}
              popupContent={item.popupContent}
              className={item.className}
              selected={item.selected}
              key={`distribution-bar-item-${index}`}
            />
          ))}
      </div>
    </div>
  )
}

export default DistributionBar
