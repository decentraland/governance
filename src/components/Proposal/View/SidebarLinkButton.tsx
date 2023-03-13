import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import Open from '../../Icon/Open'

import './DetailsSection.css'
import './SectionButton.css'

interface Props {
  loading?: boolean
  disabled?: boolean
  href: string
  children: string
  isExternal?: boolean
  icon?: React.ReactNode
}

function SidebarLinkButton({ loading, disabled, href, isExternal = true, children, icon }: Props) {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={TokenList.join([
        'DetailsSection',
        'SectionButton',
        'SidebarLinkButton',
        loading && 'SectionButton--loading',
        disabled && 'SectionButton--disabled',
      ])}
    >
      <Loader active={loading} size="small" />
      {icon}
      <span>{children}</span>
      {isExternal && <Open />}
    </a>
  )
}

export default SidebarLinkButton
