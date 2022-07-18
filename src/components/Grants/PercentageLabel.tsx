import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './PercentageLabel.css'

export type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  percentage: number
  color: 'Yellow' | 'Green' | 'Red' | 'Fuchsia'
}

const PercentageLabel = ({ percentage, color }: Props) => {
  return <span className={TokenList.join([`PercentageLabel`, `PercentageLabel--${color}`])}>{percentage}%</span>
}

export default PercentageLabel
