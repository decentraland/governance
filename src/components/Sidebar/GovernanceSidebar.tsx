import { useEffect } from 'react'

import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import './GovernanceSidebar.css'

type Props = {
  visible?: boolean
  children: React.ReactNode
  onShow?: () => void
  onHide?: () => void
  onClose?: () => void
}

export default function GovernanceSidebar({ visible, onShow, onHide, onClose, children }: Props) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const sidebar = document.querySelector('.GovernanceSidebar')
      if (sidebar && !sidebar.contains(event.target as Node) && !!onClose) {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  return (
    <Sidebar
      className="GovernanceSidebar"
      animation="push"
      onShow={onShow}
      onHide={onHide}
      direction="right"
      visible={visible}
      width="very wide"
    >
      {children}
    </Sidebar>
  )
}
