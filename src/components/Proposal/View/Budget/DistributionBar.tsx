import React from 'react'
import Skeleton from 'react-loading-skeleton'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './DistributionBar.css'
import DistributionBarItem from './DistributionBarItem'

export interface DistributionItemProps {
  value: number
  label: string
  style: string
  selected?: boolean
}

interface Props {
  items: DistributionItemProps[]
  total: number
  isLoading?: boolean
  className?: string
}

const DistributionBar = ({ items, total, isLoading, className }: Props) => {
  const t = useFormatMessage()

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
        {items.map((item, index) => (
          <DistributionBarItem
            value={item.value}
            total={total}
            label={t(item.label)}
            style={item.style}
            selected={item.selected}
            key={`${index}-dist-bar-item`}
          />
        ))}
      </div>
    </div>
  )
}

export default DistributionBar
