import React from 'react'

import classNames from 'classnames'

import './Heading.css'
import { DEFAULT_FONT_SIZE, FontSize } from './Text'

type HeadingTypes = 'h1' | 'h3'

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string
  as?: HeadingTypes
  size?: FontSize
}

export default function Heading({ as, size = DEFAULT_FONT_SIZE, className, ...props }: Props) {
  const Component = as ?? 'h2'
  return <Component {...props} className={classNames('Heading', `Heading--${size}`, className)} />
}
