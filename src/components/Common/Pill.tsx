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
  color?: PillColor | `${PillColor}`
  size?: 'small' | 'default'
  style?: 'shiny' | 'medium' | 'light' | 'outline'
  className?: string
  icon?: React.ReactNode
}

const Pill = ({ children, size = 'default', style = 'shiny', color = PillColor.Green, className, icon }: Props) => {
  return (
    <div className={TokenList.join([`Pill`, `Pill--${size}`, `Pill--${style}-${color}`, className])}>
      {icon}
      <span>{children}</span>
    </div>
  )
}

export default Pill
