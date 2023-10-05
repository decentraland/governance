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
  const hasNewNotifications = false // TODO: Integrate this

  return (
    <>
      <div>
        <button
          className={classNames('Notifications__Button', isOpen && 'Notifications__Button--active')}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={t('navigation.notifications.button_label')}
        >
          {isOpen ? <NotificationBellActive /> : <NotificationBellInactive />}
          {hasNewNotifications && !isOpen && (
            <div className="Notifications__DotOuterCircle">
              <div className="Notifications__DotInnerCircle" />
            </div>
          )}
        </button>
      </div>
      <NotificationsFeed isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  )
}
