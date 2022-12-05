import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './BoxTabsContainer.css'

interface Props {
  className?: string
  children: React.ReactNode
}

const BoxTabsContainer = ({ className, children }: Props) => {
  return <div className={TokenList.join(['BoxTabsContainer', className])}>{children}</div>
}

export default BoxTabsContainer
