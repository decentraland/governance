import { useState } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Web3Provider } from '@ethersproject/providers'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { PUSH_CHANNEL_ID } from '../../../constants'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { getCaipAddress, getPushNotificationsEnv } from '../../../utils/notifications'
import Heading from '../../Common/Typography/Heading'
import Text from '../../Common/Typography/Text'
import NotificationBellInactive from '../../Icon/NotificationBellInactive'
import SignGray from '../../Icon/SignGray'

import './UnsubscribedView.css'

interface Props {
  onSubscribeUserToChannel: () => void
}

function UnsubscribedView({ onSubscribeUserToChannel }: Props) {
  const t = useFormatMessage()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const unsubscribedKey = isSubscribing ? 'subscribing' : 'unsubscribed'
  const UnsubscribedIcon = isSubscribing ? SignGray : NotificationBellInactive

  const [user, userState] = useAuthContext()
  const chainId = userState.chainId || ChainId.ETHEREUM_GOERLI
  const env = getPushNotificationsEnv(chainId)

  const handleSubscribeUserToChannel = async () => {
    if (!user || !userState.provider) {
      return
    }

    setIsSubscribing(true)
    const signer = new Web3Provider(userState.provider).getSigner()
    const PushAPI = await import('@pushprotocol/restapi')
    await PushAPI.channels.subscribe({
      signer,
      channelAddress: getCaipAddress(PUSH_CHANNEL_ID, chainId),
      userAddress: getCaipAddress(user, chainId),
      onSuccess: () => {},
      env,
    })

    setIsSubscribing(false)
    onSubscribeUserToChannel()
  }

  return (
    <div className="NotificationsFeed__UnsubscribedView">
      <UnsubscribedIcon size="124" />
      <Heading className="NotificationsFeed__UnsubscribedViewHeading" size="sm">
        {t(`navigation.notifications.${unsubscribedKey}.title`)} {env}
      </Heading>
      <Text className="NotificationsFeed__UnsubscribedViewText">
        {t(`navigation.notifications.${unsubscribedKey}.description`)}
      </Text>
      <Button size="small" primary disabled={isSubscribing} onClick={handleSubscribeUserToChannel}>
        {t(`navigation.notifications.${unsubscribedKey}.button`)}
      </Button>
    </div>
  )
}

export default UnsubscribedView
