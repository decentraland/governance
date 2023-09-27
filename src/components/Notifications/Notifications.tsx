import { useState } from 'react'

import classNames from 'classnames'

import useFormatMessage from '../../hooks/useFormatMessage'
import NotificationBellActive from '../Icon/NotificationBellActive'
import NotificationBellInactive from '../Icon/NotificationBellInactive'

import './Notifications.css'
import NotificationsFeed from './NotificationsFeed'

export default function Notifications() {
  const t = useFormatMessage()
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <button
        className={classNames('Notifications__Button', isOpen && 'Notifications__Button--active')}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('navigation.notifications.button_label')}
      >
        {isOpen ? <NotificationBellActive /> : <NotificationBellInactive />}
      </button>
      <NotificationsFeed isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  )
}
