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

export type PillColors = 'green' | 'blue' | 'red' | 'gray' | 'purple' | 'fuchsia' | 'orange' | 'yellow'

export type Props = {
  children: React.ReactText
  color?: PillColor | PillColors
  size?: 'small' | 'default'
  style?: 'shiny' | 'medium' | 'light'
  className?: string
}

const Pill = ({ children, size = 'default', style = 'shiny', color = PillColor.Green }: Props) => {
  return (
    <span className={TokenList.join([`Pill`, `Pill--${size}`, `Pill--${style}-${color}`, className])}>{children}</span>
  )
}

export default Pill
