import useFormatMessage from '../../../hooks/useFormatMessage'
import { PushNotification } from '../../../shared/types/notifications'
import FullWidthButton from '../../Common/FullWidthButton'
import NotificationItem from '../NotificationItem'

import './ListView.css'

interface Props {
  notifications?: PushNotification[]
  lastNotificationIdIndex?: number
  showLoadMoreButton?: boolean
  onLoadMoreClick?: () => void
}

function ListView({ notifications, lastNotificationIdIndex, showLoadMoreButton, onLoadMoreClick }: Props) {
  const t = useFormatMessage()
  return (
    <div className="NotificationsFeed__ListContainer">
      <div className="NotificationsFeed__List">
        {notifications?.map((notification, index) => (
          <NotificationItem
            key={notification.payload_id}
            notification={notification}
            isNew={!!lastNotificationIdIndex && index < lastNotificationIdIndex}
          />
        ))}
      </div>
      {showLoadMoreButton && (
        <div className="NotificationsFeed__LoadMoreButtonContainer">
          <FullWidthButton onClick={onLoadMoreClick}>{t('navigation.notifications.load_more')}</FullWidthButton>
        </div>
      )}
    </div>
  )
}

export default ListView
