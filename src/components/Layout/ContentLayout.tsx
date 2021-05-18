import React from 'react'
import { navigate } from 'gatsby-plugin-intl'
import { Back } from "decentraland-ui/dist/components/Back/Back"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './ContentLayout.css'
import locations from '../../modules/locations'

export type ContentLayoutProps = {
  className?: string
  small?: boolean
  children?: React.ReactNode
}

export default function ContentLayout(props: ContentLayoutProps) {
  function handleBack() {
    const current = new URL(window.location.href)
    current.pathname = ''
    current.search = ''
    if(document.referrer.startsWith(current.toString())) {
      window.history.back()
    } else {
      navigate(locations.proposals())
    }
  }

  return <Container className={TokenList.join(['ContentLayout', props.className])}>
    <div className="ContentLayout__Back">
      <Back onClick={handleBack} />
    </div>
    <div className={TokenList.join(['ContentLayout__Container', props.small && 'ContentLayout__Container--small'])}>
      {props.children}
    </div>
  </Container>
}

export function ContentSection(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={TokenList.join(['ContentLayout__Section', props.className])} />
}