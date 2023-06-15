import React from 'react'

import classNames from 'classnames'

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type FontWeight = 'bold' | 'semi-bold' | 'normal'
type TextTransform = 'uppercase' | 'lowercase'
const TextColorDefault = 'primary'
type TextColor = typeof TextColorDefault | 'secondary'

interface Props {
  children?: React.ReactNode
  size?: FontSize
  weight?: FontWeight
  transform?: TextTransform
  color?: TextColor
  span?: boolean
  className?: string
}
const Text = ({ children, size, weight, transform, color, span, className }: Props) => {
  color = color || TextColorDefault

  return (
    <p
      className={classNames(
        'Text',
        className,
        size && `Text--size-${size}`,
        weight && `Text--weight-${weight}`,
        transform && `Text--transform-${transform}`,
        `Text--color-${color}`
      )}
    >
      {children}
    </p>
  )
}
