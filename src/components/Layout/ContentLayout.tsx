import React from 'react'

import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import usePreventNavigation from '../../hooks/usePreventNavigation'
import locations from '../../modules/locations'

import './ContentLayout.css'

export type ContentLayoutProps = {
  className?: string
  small?: boolean
  children?: React.ReactNode
  navigateHref?: string
  preventNavigation?: boolean
}

export default function ContentLayout({
  navigateHref,
  className,
  small,
  preventNavigation,
  children,
}: ContentLayoutProps) {
  function handleBack() {
    if ((window as any).routeUpdate) {
      window.history.back()
    } else {
      navigate(navigateHref || locations.proposals())
    }
  }

  usePreventNavigation(!!preventNavigation)

  return (
    <Container className={TokenList.join(['ContentLayout', className])}>
      <div className="ContentLayout__Back">
        <Back onClick={handleBack} />
      </div>
      <div className={TokenList.join(['ContentLayout__Container', small && 'ContentLayout__Container--small'])}>
        {children}
      </div>
    </Container>
  )
}

export function ContentSection(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={TokenList.join(['ContentLayout__Section', props.className])} />
}
