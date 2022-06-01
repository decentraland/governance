import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './DetailsSection.css'
import './LinkWithIcon.css'
import './SectionButton.css'

const openIcon = require('../../images/icons/open.svg').default

export type LinkWithIconProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  loading?: boolean
  disabled?: boolean
  href: string
  imageSrc?: string
  text: string | null
}

export default React.memo(function LinkWithIcon({
  loading,
  disabled,
  href,
  imageSrc,
  text,
  ...props
}: LinkWithIconProps) {
  return (
    <a
      href={href}
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
      <img src={openIcon} width="12" height="12" />
    </a>
  )
})
