import classNames from 'classnames'

import { NotificationCustomType, PushNotification } from '../../shared/types/notifications'
import Time from '../../utils/date/Time'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'
import Announcement from '../Icon/Notifications/Announcement'
import Grant from '../Icon/Notifications/Grant'
import Proposal from '../Icon/Notifications/Proposal'

import './NotificationItem.css'

interface Props {
  notification: PushNotification
  isNew: boolean
}

function getIcon(metadata: { customType: string }) {
  switch (metadata?.customType) {
    case NotificationCustomType.Announcement:
      return Announcement
    case NotificationCustomType.Grant:
      return Grant
    case NotificationCustomType.Proposal:
    default:
      return Proposal
  }
}

export default function NotificationItem({ notification, isNew }: Props) {
  const hasLink = !!notification.payload.data.acta
  const Component = hasLink ? Link : 'div'
  const metadata = notification.payload.data.additionalMeta?.data || ''
  const Icon = getIcon(metadata ? JSON.parse(metadata) : null)

  return (
    <Component
      className={classNames('NotificationItem', isNew && 'NotificationItem--new')}
      href={notification.payload.data.acta}
    >
      <div className="NotificationItem__IconContainer">
        <Icon />
      </div>
      <div>
        <Markdown className="NotificationItem__Text" size="sm">
          {notification.payload.data.amsg}
        </Markdown>
        <Text className="NotificationItem__Date" color="secondary" size="xs">
          {Time(notification.epoch).fromNow()}
        </Text>
      </div>
    </Component>
  )
}
