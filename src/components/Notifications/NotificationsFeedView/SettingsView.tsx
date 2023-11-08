import { Radio } from 'decentraland-ui/dist/components/Radio/Radio'

import useFormatMessage from '../../../hooks/useFormatMessage'
import Text from '../../Common/Typography/Text'

import './SettingsView.css'

interface Props {
  isPushEnabled: boolean
  onPushChange: (isEnabled: boolean) => Promise<void>
  isDiscordEnabled: boolean
  onDiscordChange: (isEnabled: boolean) => Promise<void>
  isLoading: boolean
}

function SettingsView({ isPushEnabled, onPushChange, isDiscordEnabled, onDiscordChange, isLoading }: Props) {
  const t = useFormatMessage()
  return (
    <div className="NotificationSettings__Container">
      <div className="NotificationSettings__Item">
        <div className="NotificationSettings__TextContainer">
          <Text size="md" weight="semi-bold" className="NotificationSettings__TextTitle">
            {t('navigation.notifications.settings.push_title')}
          </Text>
          <Text size="sm" weight="normal" color="secondary">
            {t('navigation.notifications.settings.push_description')}
          </Text>
        </div>
        <Radio toggle checked={isPushEnabled} disabled={isLoading} onChange={() => onPushChange(!isPushEnabled)} />
      </div>
      <div className="NotificationSettings__Item">
        <div className="NotificationSettings__TextContainer">
          <Text size="md" weight="semi-bold" className="NotificationSettings__TextTitle">
            {t('navigation.notifications.settings.discord_title')}
          </Text>
          <Text size="sm" weight="normal" color="secondary">
            {t('navigation.notifications.settings.discord_description')}
          </Text>
        </div>
        <Radio
          toggle
          checked={isDiscordEnabled}
          disabled={isLoading}
          onChange={() => onDiscordChange(!isDiscordEnabled)}
        />
      </div>
    </div>
  )
}

export default SettingsView
