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
}

export type Props = {
  children: React.ReactText
  color?: PillColor | `${PillColor}`
  size?: 'sm' | 'md'
  style?: 'shiny' | 'medium' | 'light' | 'outline'
  transparent?: boolean
  className?: string
  icon?: React.ReactNode
}

export default function Pill({
  children,
  size = 'md',
  style = 'shiny',
  color = PillColor.Green,
  transparent,
  className,
  icon,
}: Props) {
  return (
    <div
      className={classNames(
        `Pill`,
        `Pill--${size}`,
        transparent ? `Pill--transparent` : `Pill--${style}-${color}`,
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </div>
  )
}
