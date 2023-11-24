import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { DAO_DISCORD_URL } from '../../../constants'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Heading from '../../Common/Typography/Heading'
import Link from '../../Common/Typography/Link'
import Text from '../../Common/Typography/Text'
import DaoLogo from '../../Icon/DaoLogo'

import './DiscordConnectView.css'

interface Props {
  onJoinDiscord: () => void
  onAlreadyJoined: () => void
}

function DiscordConnectView({ onJoinDiscord, onAlreadyJoined }: Props) {
  const t = useFormatMessage()
  return (
    <div className="NotificationsFeed__DiscordConnectView">
      <DaoLogo />
      <Heading className="NotificationsFeed__DiscordConnectViewHeading" size="sm">
        {t(`navigation.notifications.discord_connect.title`)}
      </Heading>
      <Text className="NotificationsFeed__DiscordConnectViewText">
        {t(`navigation.notifications.discord_connect.description`)}
      </Text>
      <Button
        className="NotificationsFeed__DiscordConnectViewPrimaryButton"
        as={Link}
        href={DAO_DISCORD_URL}
        size="small"
        primary
        onClick={onJoinDiscord}
      >
        {t(`navigation.notifications.discord_connect.primary_button`)}
      </Button>
      <Button size="small" basic onClick={onAlreadyJoined}>
        {t(`navigation.notifications.discord_connect.secondary_button`)}
      </Button>
    </div>
  )
}

export default DiscordConnectView
