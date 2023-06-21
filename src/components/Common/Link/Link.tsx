import React, { useMemo } from 'react'

import classNames from 'classnames'

import './Link.css'

function isLocalLink(href?: string | null) {
  return (
    typeof href === 'string' && !href.startsWith('https://') && !href.startsWith('http://') && !href.startsWith('//')
  )
}

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>

export default function Link({ target, rel, ...props }: LinkProps) {
  const isLocal = isLocalLink(props.href)
  const linkTarget = useMemo(() => (!target && !isLocal ? '_blank' : target || undefined), [isLocal, target])
  const linkRel = useMemo(() => (!isLocal ? classNames(rel, 'noopener', 'noreferrer') : rel), [isLocal, rel])

  return (
    <a
      {...props}
      className={classNames('Link', (props.onClick || props.href) && 'Link--pointer', props.className)}
      target={linkTarget}
      rel={linkRel}
    />
  )
}
