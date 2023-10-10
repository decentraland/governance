import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar/Sidebar'

import { useClickOutside } from '../../hooks/useClickOutside'

import './GovernanceSidebar.css'

type Props = {
  visible?: boolean
  children: React.ReactNode
  onShow?: () => void
  onHide?: () => void
  onClose?: () => void
}

export default function GovernanceSidebar({ visible, onShow, onHide, onClose, children }: Props) {
  useClickOutside('.GovernanceSidebar', !!visible, onClose)

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
