import Time from '../../utils/date/Time'
import type { Notification } from '../../utils/notifications'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'

import './NotificationItem.css'

interface Props {
  notification: Notification
}

export default function NotificationItem({ notification }: Props) {
  const hasLink = !!notification.payload.data.acta
  const Component = hasLink ? Link : 'div'

  return (
    <Component className="NotificationItem" href={notification.payload.data.acta}>
      <Text className="NotificationItem__Text" size="sm">
        {notification.payload.data.amsg}
      </Text>
      <Text className="NotificationItem__Date" color="secondary" size="xs">
        {Time(notification.epoch).fromNow()}
      </Text>
    </Component>
  )
}
