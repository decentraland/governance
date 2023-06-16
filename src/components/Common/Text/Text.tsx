import React from 'react'

import classNames from 'classnames'

import './Text.css'

const DEFAULT_COLOR = 'default'
const DEFAULT_FONT_WEIGHT = 'normal'
const DEFAULT_FONT_SIZE = 'md'
export type FontSize = 'xs' | 'sm' | typeof DEFAULT_FONT_SIZE | 'lg' | 'xl'
type FontWeight = 'bold' | 'semi-bold' | typeof DEFAULT_FONT_WEIGHT
type TextColor = typeof DEFAULT_COLOR | 'primary' | 'secondary'

interface Props {
  children?: React.ReactNode
  size?: FontSize
  weight?: FontWeight
  color?: TextColor
  className?: string
}

export default function Text({ children, size, weight, color, className }: Props) {
  color = color || DEFAULT_COLOR
  size = size || DEFAULT_FONT_SIZE
  weight = weight || DEFAULT_FONT_WEIGHT

  return (
    <p
      className={classNames('Text', className, `Text--size-${size}`, `Text--weight-${weight}`, `Text--color-${color}`)}
    >
      {children}
    </p>
  )
}
