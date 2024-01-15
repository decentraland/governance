import classNames from 'classnames'
import { withPrefix } from 'gatsby'

import { toGovernancePathname } from '../../../helpers/browser'
import { navigate } from '../../../utils/locations'

import './Link.css'

function isMetaClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement>

function isLocalLink(href?: string | null) {
  return (
    typeof href === 'string' && !href.startsWith('https://') && !href.startsWith('http://') && !href.startsWith('//')
  )
}

const TARGET_BLANK = '_blank'

export default function Link({ target, rel, href, onClick, className, ...props }: Props) {
  const isLocal = isLocalLink(href)
  const linkTarget = !isLocal ? target || TARGET_BLANK : undefined
  const linkRel = !isLocal ? classNames(rel, 'noopener', 'noreferrer') : rel
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e)
    }

    const isBlank = e.currentTarget.target === TARGET_BLANK
    if (isLocal && href && !isBlank && !isMetaClick(e)) {
      const internalPath = toGovernancePathname(href)
      e.preventDefault()
      navigate(internalPath)
    }
  }

  return (
    <a
      {...props}
      className={classNames('Link', (onClick || href) && 'Link--pointer', className)}
      target={linkTarget}
      rel={linkRel}
      href={withPrefix(href || '')}
      onClick={handleClick}
    />
  )
}
