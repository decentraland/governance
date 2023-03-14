import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { getFormattedPercentage } from '../../../helpers'

import './HorizontalBar.css'

export type HorizontalBarProps = {
  value: number
  total: number
  className: string
  selected?: boolean
}

const HorizontalBar = ({ value, className, selected, total }: HorizontalBarProps) => {
  const valuePercentage = getFormattedPercentage(value, total)

  return (
    <div
      className={TokenList.join(['HorizontalBar', !!selected && 'HorizontalBar--selected', className])}
      style={{ width: valuePercentage }}
    />
  )
}

export default HorizontalBar
