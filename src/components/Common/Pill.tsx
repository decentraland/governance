import React from 'react'

import classNames from 'classnames'

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
  Aqua = 'aqua',
  White = 'white',
  Transparent = 'transparent',
}

export type Props = {
  children: React.ReactText
  color?: PillColor | `${PillColor}`
  size?: 'sm' | 'md'
  style?: 'shiny' | 'medium' | 'light' | 'outline'
  className?: string
  icon?: React.ReactNode
}

export default function Pill({
  children,
  size = 'md',
  style = 'shiny',
  color = PillColor.Green,
  className,
  icon,
}: Props) {
  return (
    <div className={classNames(`Pill`, `Pill--${size}`, `Pill--${style}-${color}`, className)}>
      {icon}
      <span>{children}</span>
    </div>
  )
}
