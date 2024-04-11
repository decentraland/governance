import React from 'react'

import classNames from 'classnames'

import './Text.css'

const DEFAULT_COLOR: TextColor = 'default'
const DEFAULT_FONT_WEIGHT: FontWeight = 'normal'
const DEFAULT_FONT_SIZE: FontSize = 'md'
const DEFAULT_FONT_STYLE: FontStyle = 'normal'
export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type FontWeight = 'bold' | 'semi-bold' | 'normal' | 'medium' | 'light'
type TextColor = 'default' | 'primary' | 'secondary' | 'error' | 'white-900'
type FontStyle = 'normal' | 'italic'

interface Props {
  children?: React.ReactNode
  className?: string
  size?: FontSize
  weight?: FontWeight
  color?: TextColor
  style?: FontStyle
  as?: 'span'
  title?: string
}

const Text = React.forwardRef<HTMLParagraphElement, Props>(
  (
    {
      children,
      size = DEFAULT_FONT_SIZE,
      weight = DEFAULT_FONT_WEIGHT,
      color = DEFAULT_COLOR,
      style = DEFAULT_FONT_STYLE,
      className,
      as,
      title,
    },
    ref
  ) => {
    const componentClassNames = classNames(
      'Text',
      `Text--size-${size}`,
      `Text--weight-${weight}`,
      `Text--color-${color}`,
      `Text--style-${style}`,
      className
    )
    const Component = as ?? 'p'
    return (
      <Component className={componentClassNames} ref={ref} title={title}>
        {children}
      </Component>
    )
  }
)

Text.displayName = 'Text'

export default Text
