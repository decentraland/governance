import Time from '../../utils/date/Time'
import { Notification, NotificationCustomType } from '../../utils/notifications'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'
import CheckCircle from '../Icon/CheckCircle'
import CheckCircleOutline from '../Icon/CheckCircleOutline'
import QuestionCircle from '../Icon/QuestionCircle'

import './NotificationItem.css'

interface Props {
  notification: Notification
}

function getIcon(metadata: { customType: string }) {
  switch (metadata?.customType) {
    case NotificationCustomType.Announcement:
      return QuestionCircle // TODO: Add Announcement icon
    case NotificationCustomType.Grant:
      return CheckCircleOutline // TODO: Add Grant icon
    case NotificationCustomType.Proposal:
    default:
      return CheckCircle // TODO: Add Proposal icon
  }
}

export default function NotificationItem({ notification }: Props) {
  const hasLink = !!notification.payload.data.acta
  const Component = hasLink ? Link : 'div'
  const metadata = notification.payload.data.additionalMeta?.data || ''
  const Icon = getIcon(metadata ? JSON.parse(metadata) : null)

  return (
    <Component className="NotificationItem" href={notification.payload.data.acta}>
      <div className="NotificationItem__IconContainer">
        <Icon size="24" />
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
