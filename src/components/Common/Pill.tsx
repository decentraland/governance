import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './Pill.css'

export enum PillColor {
  Green = 'green',
  Blue = 'blue',
  Red = 'red',
  Gray = 'gray',
  Purple = 'purple',
  Fuchsia = 'fuchsia',
  Orange = 'orange',
  Yellow = 'yellow',
}

export type Props = {
  children: React.ReactText
  color?: PillColor | 'green' | 'blue' | 'red' | 'gray' | 'purple' | 'fuchsia' | 'orange' | 'yellow'
  size?: 'small' | 'default'
  style?: 'shiny' | 'medium' | 'light'
}

const Pill = ({ children, size = 'small', style = 'shiny', color = PillColor.Green }: Props) => {
  return (
    <div className={TokenList.join([`Pill`, `Pill--${size}`, `Pill--${style}-${color}`])}>
      <span>{children}</span>
    </div>
  )
}

export default Pill
