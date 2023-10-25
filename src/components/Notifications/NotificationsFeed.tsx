import { useState } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { PUSH_CHANNEL_ID } from '../../constants'
import { useClickOutside } from '../../hooks/useClickOutside'
import useFormatMessage from '../../hooks/useFormatMessage'
import { PushNotification } from '../../shared/types/notifications'
import { getCaipAddress, getPushNotificationsEnv } from '../../utils/notifications'
import FullWidthButton from '../Common/FullWidthButton'
import Heading from '../Common/Typography/Heading'
import Text from '../Common/Typography/Text'
import NotificationBellInactive from '../Icon/NotificationBellInactive'
import PeaceCircle from '../Icon/PeaceCircle'
import SignGray from '../Icon/SignGray'

import NotificationItem from './NotificationItem'
import './NotificationsFeed.css'

const NOTIFICATIONS_PER_PAGE = 5

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubscriptionChangeSuccess: () => void
  userNotifications: PushNotification[] | null | undefined
  isSubscribed: boolean
  isLoadingNotifications: boolean
  isRefetchingNotifications: boolean
  isLoadingSubscriptions: boolean
  isRefetchingSubscriptions: boolean
  lastNotificationId: number | null | undefined
}

export default function NotificationsFeed({
  isOpen,
  onClose,
  onSubscriptionChangeSuccess,
  userNotifications,
  isSubscribed,
  isLoadingNotifications,
  isRefetchingNotifications,
  isLoadingSubscriptions,
  isRefetchingSubscriptions,
  lastNotificationId,
}: Props) {
  const t = useFormatMessage()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [user, userState] = useAuthContext()
  const [notificationsPerPage, setNotificationsPerPage] = useState(NOTIFICATIONS_PER_PAGE)
  const lastNotificationIdIndex = userNotifications?.findIndex((item) => item.payload_id === lastNotificationId)

  useClickOutside('.NotificationsFeed', isOpen, onClose)
  const chainId = userState.chainId || ChainId.ETHEREUM_GOERLI
  const env = getPushNotificationsEnv(chainId)

  const handleSubscribeUserToChannel = async () => {
    if (!user || !userState.provider) {
      return
    }

    setIsSubscribing(true)
    const signer = new Web3Provider(userState.provider).getSigner()

    await PushAPI.channels.subscribe({
      signer,
      channelAddress: getCaipAddress(PUSH_CHANNEL_ID, chainId),
      userAddress: getCaipAddress(user, chainId),
      onSuccess: onSubscriptionChangeSuccess,
      env,
    })

    setIsSubscribing(false)
  }

  const handleUnsubscribeUserToChannel = async () => {
    if (!user || !userState.provider) {
      return
    }

    const signer = new Web3Provider(userState.provider).getSigner()

    await PushAPI.channels.unsubscribe({
      signer,
      channelAddress: getCaipAddress(PUSH_CHANNEL_ID, chainId),
      userAddress: getCaipAddress(user, chainId),
      onSuccess: onSubscriptionChangeSuccess,
      env,
    })
  }

  const handleLoadMoreClick = () => {
    if (filteredNotifications) {
      setNotificationsPerPage(filteredNotifications.length + NOTIFICATIONS_PER_PAGE)
    }
  }

  const filteredNotifications = userNotifications?.slice(0, notificationsPerPage)
  const hasNotifications = filteredNotifications && filteredNotifications.length > 0
  const showNotifications = isSubscribed && !isLoadingNotifications && hasNotifications
  const showLoadMoreButton = filteredNotifications?.length !== userNotifications?.length
  const unsubscribedKey = isSubscribing ? 'subscribing' : 'unsubscribed'
  const UnsubscribedIcon = isSubscribing ? SignGray : NotificationBellInactive
  const isLoading =
    isLoadingSubscriptions ||
    isRefetchingSubscriptions ||
    isRefetchingNotifications ||
    (isSubscribed && isLoadingNotifications)

  return (
    <div className={classNames('NotificationsFeed', isOpen && 'NotificationsFeed--visible')}>
      <div className="NotificationsFeed__Header">
        <Text color="secondary" size="sm" className="NotificationsFeed__Title">
          {t('navigation.notifications.title')}
        </Text>
        {isSubscribed && (
          <button className="NotificationsFeed__OptOut" onClick={handleUnsubscribeUserToChannel}>
            {t('navigation.notifications.opt_out')}
          </button>
        )}
      </div>
      {!isLoading && (
        <div className="NotificationsFeed__Content">
          {!isSubscribed && (
            <div className="NotificationsFeed__UnsubscribedView">
              <UnsubscribedIcon size="124" />
              <Heading className="NotificationsFeed__UnsubscribedViewHeading" size="sm">
                {t(`navigation.notifications.${unsubscribedKey}.title`)}
              </Heading>
              <Text>{t(`navigation.notifications.${unsubscribedKey}.description`)}</Text>
              <Button size="small" primary disabled={isSubscribing} onClick={handleSubscribeUserToChannel}>
                {t(`navigation.notifications.${unsubscribedKey}.button`)}
              </Button>
            </div>
          )}
          {isSubscribed && !isLoadingNotifications && !hasNotifications && (
            <div className="NotificationsFeed__EmptyView">
              <PeaceCircle />
              <Text color="secondary" weight="medium">
                {t('navigation.notifications.empty')}
              </Text>
            </div>
          )}
          {showNotifications && (
            <div className="NotificationsFeed__ListContainer">
              <div className="NotificationsFeed__List">
                {filteredNotifications?.map((notification, index) => (
                  <NotificationItem
                    key={notification.payload_id}
                    notification={notification}
                    isNew={!!lastNotificationIdIndex && index < lastNotificationIdIndex}
                  />
                ))}
              </div>
              {showLoadMoreButton && (
                <div className="NotificationsFeed__LoadMoreButtonContainer">
                  <FullWidthButton onClick={handleLoadMoreClick}>
                    {t('navigation.notifications.load_more')}
                  </FullWidthButton>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {isLoading && <Loader active />}
    </div>
  )
}
