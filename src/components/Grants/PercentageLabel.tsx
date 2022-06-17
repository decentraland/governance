import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './PercentageLabel.css'

export type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  percentage: number
  color: 'Yellow' | 'Green' | 'Red'
}

const PercentageLabel = ({ percentage, color }: Props) => {
  return (
    <div className={TokenList.join([`PercentageLabel`, `PercentageLabel--${color}`])}>
      <span>{percentage}%</span>
    </div>
  )
}

export default PercentageLabel
