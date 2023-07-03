import React from 'react'

import classNames from 'classnames'

import { navigate } from '../../../utils/locations'

import './Link.css'

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement>

function isLocalLink(href?: string | null) {
  return (
    typeof href === 'string' && !href.startsWith('https://') && !href.startsWith('http://') && !href.startsWith('//')
  )
}

export default function Link({ target, rel, href, onClick, className, ...props }: Props) {
  const isLocal = isLocalLink(href)
  const linkTarget = !target && !isLocal ? '_blank' : target || undefined
  const linkRel = !isLocal ? classNames(rel, 'noopener', 'noreferrer') : rel
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e)
    }
    if (isLocal && href) {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <a
      {...props}
      className={classNames('Link', (onClick || href) && 'Link--pointer', className)}
      target={linkTarget}
      rel={linkRel}
      href={href}
      onClick={handleClick}
    />
  )
}
