import { useEffect, useState } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { PUSH_CHANNEL_ID } from '../../constants'
import { AccountType } from '../../entities/User/types'
import { useClickOutside } from '../../hooks/useClickOutside'
import useFormatMessage from '../../hooks/useFormatMessage'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import { PushNotification } from '../../shared/types/notifications'
import { getCaipAddress, getPushNotificationsEnv } from '../../utils/notifications'
import Text from '../Common/Typography/Text'
import AccountsConnectModal from '../Modal/IdentityConnectModal/AccountsConnectModal'

import DiscordView from './NotificationsFeedView/DiscordView'
import EmptyView from './NotificationsFeedView/EmptyView'
import ListView from './NotificationsFeedView/ListView'
import UnsubscribedView from './NotificationsFeedView/UnsubscribedView'

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
  const [isDiscordConnect, setIsDiscordConnect] = useState(false)
  const [user, userState] = useAuthContext()
  const [notificationsPerPage, setNotificationsPerPage] = useState(NOTIFICATIONS_PER_PAGE)
  const lastNotificationIdIndex = userNotifications?.findIndex((item) => item.payload_id === lastNotificationId)
  const { isProfileValidated: isValidatedOnDiscord, refetch } = useIsProfileValidated(user, [AccountType.Discord])

  useEffect(() => {
    if (isOpen && !isValidatedOnDiscord) {
      refetch()
    }
  }, [isValidatedOnDiscord, isOpen, refetch])

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

  const handleDiscordConnect = () => {
    setIsDiscordConnect(true)
    onClose()
  }

  const filteredNotifications = userNotifications?.slice(0, notificationsPerPage)
  const hasNotifications = filteredNotifications && filteredNotifications.length > 0
  const showNotifications = isSubscribed && !isLoadingNotifications && hasNotifications
  const showLoadMoreButton = filteredNotifications?.length !== userNotifications?.length
  const unsubscribedKey = isSubscribing ? 'subscribing' : 'unsubscribed'
  const isLoading =
    isLoadingSubscriptions ||
    isRefetchingSubscriptions ||
    isRefetchingNotifications ||
    (isSubscribed && isLoadingNotifications)
  const showEmptyView = isSubscribed && !isLoadingNotifications && !hasNotifications

  return (
    <div
      className={classNames(
        'NotificationsFeed',
        isOpen && 'NotificationsFeed--visible',
        isLoading && 'NotificationsFeed--loading'
      )}
    >
      <div className="NotificationsFeed__Header">
        <Text color="secondary" size="sm" className="NotificationsFeed__Title">
          {t('navigation.notifications.title')}
        </Text>
        {(isSubscribed || isValidatedOnDiscord) && (
          <button className="NotificationsFeed__SettingsButton" onClick={handleUnsubscribeUserToChannel}>
            {t('navigation.notifications.settings')}
          </button>
        )}
      </div>
      {!isLoading && (
        <div className="NotificationsFeed__Content">
          {!isSubscribed && !isValidatedOnDiscord && (
            <UnsubscribedView
              unsubscribedKey={unsubscribedKey}
              isSubscribing={isSubscribing}
              handleSubscribeUserToChannel={handleSubscribeUserToChannel}
              handleDiscordConnect={handleDiscordConnect}
            />
          )}
          {isValidatedOnDiscord && !isSubscribed && (
            <DiscordView isSubscribing={isSubscribing} handleSubscribeUserToChannel={handleSubscribeUserToChannel} />
          )}
          {showEmptyView && <EmptyView />}
          {showNotifications && (
            <ListView
              notifications={filteredNotifications}
              lastNotificationIdIndex={lastNotificationIdIndex}
              showLoadMoreButton={showLoadMoreButton}
              handleLoadMoreClick={handleLoadMoreClick}
            />
          )}
        </div>
      )}
      {isLoading && <Loader active />}
      {!isValidatedOnDiscord && (
        <AccountsConnectModal
          open={isDiscordConnect}
          onClose={() => setIsDiscordConnect(false)}
          account={AccountType.Discord}
        />
      )}
    </div>
  )
}
