import { Button } from 'decentraland-ui/dist/components/Button/Button'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Heading from '../../Common/Typography/Heading'
import Text from '../../Common/Typography/Text'
import DiscordNotificationLogo from '../../Icon/DiscordNotificationLogo'

import './DiscordView.css'

interface Props {
  isSubscribing: boolean
  onSubscribeUserToChannel: () => void
}

function DiscordView({ isSubscribing, onSubscribeUserToChannel }: Props) {
  const t = useFormatMessage()
  return (
    <div className="NotificationsFeed__DiscordView">
      <DiscordNotificationLogo size="124" />
      <Heading className="NotificationsFeed__DiscordViewHeading" size="sm">
        {t(`navigation.notifications.discord.title`)}
      </Heading>
      <Text className="NotificationsFeed__DiscordViewText">{t(`navigation.notifications.discord.description`)}</Text>
      <Button size="small" primary disabled={isSubscribing} onClick={onSubscribeUserToChannel}>
        {t(`navigation.notifications.discord.button`)}
      </Button>
    </div>
  )
}

export default DiscordView
