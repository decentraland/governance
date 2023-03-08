import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import Open from '../../Icon/Open'

import './DetailsSection.css'
import './LinkWithIcon.css'
import './SectionButton.css'

export type ExternalLinkWithIconProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  loading?: boolean
  disabled?: boolean
  href: string
  imageSrc?: string
  text: string | null
}

export default React.memo(function ExternalLinkWithIcon({
  loading,
  disabled,
  href,
  imageSrc,
  text,
  ...props
}: ExternalLinkWithIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={TokenList.join([
        'DetailsSection',
        'SectionButton',
        'LinkWithIcon',
        loading && 'SectionButton--loading',
        disabled && 'SectionButton--disabled',
        props.className,
      ])}
    >
      <Loader active={loading} size="small" />
      <img src={imageSrc} width="20" height="20" />
      <span>{text}</span>
      <Open />
    </a>
  )
})
