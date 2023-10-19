import { useEffect, useRef } from 'react'

import classNames from 'classnames'

import './GovernanceSidebar.css'
import Overlay from './Overlay'

type Props = {
  visible: boolean
  children: React.ReactNode
  onShow?: () => void
  onHide?: () => void
  onClose: () => void
}

const ANIMATION_DURATION = 500

export default function GovernanceSidebar({ visible = false, onShow, onHide, onClose, children }: Props) {
  const prevVisible = useRef(visible)
  useEffect(() => {
    if (prevVisible.current && !visible) {
      if (onHide) {
        onHide()
      }
    } else if (!prevVisible.current && visible) {
      if (onShow) {
        setTimeout(onShow, ANIMATION_DURATION)
      }
    }
    prevVisible.current = visible
  }, [onHide, onShow, visible])

  return (
    <>
      <Overlay isOpen={visible} onClick={onClose} />
      <div className={classNames('GovernanceSidebar', visible && 'GovernanceSidebar--open')}>{children}</div>
    </>
  )
}
