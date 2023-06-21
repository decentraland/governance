import React from 'react'

import classNames from 'classnames'

import './Text.css'

const DEFAULT_COLOR: TextColor = 'default'
const DEFAULT_FONT_WEIGHT: FontWeight = 'normal'
const DEFAULT_FONT_SIZE: FontSize = 'md'
const DEFAULT_FONT_STYLE: FontStyle = 'normal'
type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type FontWeight = 'bold' | 'semi-bold' | 'normal'
type TextColor = 'default' | 'primary' | 'secondary'
type FontStyle = 'normal' | 'italic'

interface Props {
  children?: React.ReactNode
  className?: string
  size?: FontSize
  weight?: FontWeight
  color?: TextColor
  style?: FontStyle
}

export default function Text({
  children,
  size = DEFAULT_FONT_SIZE,
  weight = DEFAULT_FONT_WEIGHT,
  color = DEFAULT_COLOR,
  style = DEFAULT_FONT_STYLE,
  className,
}: Props) {
  return (
    <p
      className={classNames(
        'Text',
        `Text--size-${size}`,
        `Text--weight-${weight}`,
        `Text--color-${color}`,
        `Text--style-${style}`,
        className
      )}
    >
      {children}
    </p>
  )
}
