import React from 'react'

import classNames from 'classnames'

import './Heading.css'

type HeadingTypes = 'h1' | 'h3'

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string
  as?: HeadingTypes
}

export default function Heading(props: Props) {
  const { as, className } = props
  if (as === 'h1') return <h1 {...props} className={classNames('Heading', 'Heading--h1', className)} />
  if (as === 'h3') return <h3 {...props} className={classNames('Heading', 'Heading--h3', className)} />
  return <h2 {...props} className={classNames('Heading', 'Heading--h2', className)} />
}
