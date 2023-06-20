import React from 'react'

import classNames from 'classnames'

import './Text.css'

const DEFAULT_COLOR: TextColor = 'default'
const DEFAULT_FONT_WEIGHT: FontWeight = 'normal'
const DEFAULT_FONT_SIZE: FontSize = 'md'
type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type FontWeight = 'bold' | 'semi-bold' | 'normal'
type TextColor = 'default' | 'primary' | 'secondary'

interface Props {
  children?: React.ReactNode
  size?: FontSize
  weight?: FontWeight
  color?: TextColor
  className?: string
}

export default function Text({
  children,
  size = DEFAULT_FONT_SIZE,
  weight = DEFAULT_FONT_WEIGHT,
  color = DEFAULT_COLOR,
  className,
}: Props) {
  return (
    <p
      className={classNames('Text', className, `Text--size-${size}`, `Text--weight-${weight}`, `Text--color-${color}`)}
    >
      {children}
    </p>
  )
}
