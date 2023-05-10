import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Sidebar, { SidebarProps } from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import './GovernanceSidebar.css'

type Props = {
  visible?: boolean
  className?: string
  children: React.ReactNode
  onShow?: (event: React.MouseEvent<HTMLElement>, data: SidebarProps) => void
  onHide?: (event: React.MouseEvent<HTMLElement>, data: SidebarProps) => void
}

export default function GovernanceSidebar({ visible, onShow, onHide, className, children }: Props) {
  return (
    <Sidebar
      className={TokenList.join(['GovernanceSidebar', className])}
      animation={'push'}
      onShow={onShow}
      onHide={onHide}
      direction={'right'}
      visible={visible}
      width={'very wide'}
    >
      {children}
    </Sidebar>
  )
}
