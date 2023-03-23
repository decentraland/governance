import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './SidebarHeaderLabel.css'

interface Props {
  children: React.ReactText
  className?: string
}

export default function SidebarHeaderLabel({ className, children }: Props) {
  return <div className={TokenList.join(['SidebarHeaderLabel', className])}>{children}</div>
}
