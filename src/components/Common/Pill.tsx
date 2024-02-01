import classNames from 'classnames'

import Link from './Typography/Link'

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

export enum PillStyle {
  Shiny = 'shiny',
  Medium = 'medium',
  Light = 'light',
  Outline = 'outline',
}

export type PillStyleType = PillStyle | `${PillStyle}`

export type Props = {
  children: React.ReactText
  color?: PillColor | `${PillColor}`
  size?: 'sm' | 'md'
  style?: PillStyleType
  className?: string
  icon?: React.ReactNode
  href?: string
}

export default function Pill({
  children,
  size = 'md',
  style = 'shiny',
  color = PillColor.Green,
  className,
  href,
  icon,
}: Props) {
  const component = (
    <div className={classNames(`Pill`, `Pill--${size}`, `Pill--${style}-${color}`, className)}>
      {icon}
      <span className="Pill__Content">{children}</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="Pill__Link">
        {component}
      </Link>
    )
  }

  return component
}
