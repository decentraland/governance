import React, { useCallback, useMemo } from 'react'

import classNames from 'classnames'

import { isLocalLink, navigate } from '../../utils/locations'

import './Link.css'

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>

export default React.memo(function Link({ target, rel, href, onClick, ...props }: LinkProps) {
  const isLocal = useMemo(() => isLocalLink(href), [href])
  const linkTarget = useMemo(() => (!target && !isLocal ? '_blank' : target || undefined), [isLocal, target])
  const linkRel = useMemo(() => (!isLocal ? classNames(rel, 'noopener', 'noreferrer') : rel), [isLocal, rel])
  const onClickHandler = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e)
      }
      if (isLocal && href) {
        e.preventDefault()
        navigate(href)
      }
    },
    [href, isLocal, onClick]
  )

  return (
    <a
      {...props}
      className={classNames('Link', (onClick || href) && 'Link--pointer', props.className)}
      target={linkTarget}
      rel={linkRel}
      href={href}
      onClick={onClickHandler}
    />
  )
})
