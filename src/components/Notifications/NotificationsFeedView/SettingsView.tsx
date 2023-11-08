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
            In-App Notifications
          </Text>
          <Text size="sm" weight="normal" color="secondary">
            Powered by Push.org
          </Text>
        </div>
        <Radio toggle checked={isPushEnabled} disabled={isLoading} onChange={() => onPushChange(!isPushEnabled)} />
      </div>
      <div className="NotificationSettings__Item">
        <div className="NotificationSettings__TextContainer">
          <Text size="md" weight="semi-bold" className="NotificationSettings__TextTitle">
            Discord Notifications
          </Text>
          <Text size="sm" weight="normal" color="secondary">
            Powered by Discord
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
