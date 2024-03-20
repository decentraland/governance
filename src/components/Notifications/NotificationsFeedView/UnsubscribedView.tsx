import { Button } from 'decentraland-ui/dist/components/Button/Button'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Heading from '../../Common/Typography/Heading'
import Text from '../../Common/Typography/Text'
import NotificationBellInactive from '../../Icon/NotificationBellInactive'
import SignGray from '../../Icon/SignGray'

import './UnsubscribedView.css'

interface Props {
  unsubscribedKey: string
  isSubscribing: boolean
  onSubscribeUserToChannel: () => void
  onDiscordConnect?: () => void
}

function UnsubscribedView({ unsubscribedKey, isSubscribing, onSubscribeUserToChannel, onDiscordConnect }: Props) {
  const t = useFormatMessage()
  const UnsubscribedIcon = isSubscribing ? SignGray : NotificationBellInactive
  return (
    <div className="NotificationsFeed__UnsubscribedView">
      <UnsubscribedIcon size="124" />
      <Heading className="NotificationsFeed__UnsubscribedViewHeading" size="sm">
        {t(`navigation.notifications.${unsubscribedKey}.title`)}
      </Heading>
      <Text className="NotificationsFeed__UnsubscribedViewText">
        {t(`navigation.notifications.${unsubscribedKey}.description`)}
      </Text>
      <Button size="small" primary disabled={isSubscribing} onClick={onSubscribeUserToChannel}>
        {t(`navigation.notifications.${unsubscribedKey}.button`)}
      </Button>
      {onDiscordConnect && (
        <Button size="small" basic disabled={isSubscribing} onClick={onDiscordConnect}>
          {t(`navigation.notifications.unsubscribed.discord`)}
        </Button>
      )}
    </div>
  )
}

export default UnsubscribedView
