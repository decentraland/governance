import React, { useEffect, useMemo, useState } from 'react'

import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import './BadgesSidebar.css'

interface Props {
  isSidebarVisible: boolean
}

export default function BadgesSidebar({ isSidebarVisible }: Props) {
  return (
    <Sidebar
      className="BadgesSidebar"
      animation={'push'}
      // onShow={() => {
      //   setShowPopups(true)
      // }}
      // onHide={() => {
      //   setShowPopups(false)
      // }}
      direction={'right'}
      visible={isSidebarVisible}
      width={'very wide'}
    ></Sidebar>
  )
}
