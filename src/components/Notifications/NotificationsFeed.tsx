import { useState } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ErrorClient } from '../../clients/ErrorClient'
import { Governance } from '../../clients/Governance'
import { PUSH_CHANNEL_ID } from '../../constants'
import { AccountType } from '../../entities/User/types'
import { useClickOutside } from '../../hooks/useClickOutside'
import useFormatMessage from '../../hooks/useFormatMessage'
import useIsDiscordActive from '../../hooks/useIsDiscordActive'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import { PushNotification } from '../../shared/types/notifications'
import { ErrorCategory } from '../../utils/errorCategories'
import { isProdEnv } from '../../utils/governanceEnvs'
import { getCaipAddress, getPushNotificationsEnv } from '../../utils/notifications'
import Text from '../Common/Typography/Text'
import ChevronLeft from '../Icon/ChevronLeft'
import AccountsConnectModal from '../Modal/IdentityConnectModal/AccountsConnectModal'

import DiscordConnectView from './NotificationsFeedView/DiscordConnectView'
import DiscordView from './NotificationsFeedView/DiscordView'
import EmptyView from './NotificationsFeedView/EmptyView'
import ListView from './NotificationsFeedView/ListView'
import SettingsView from './NotificationsFeedView/SettingsView'
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
  const { isProfileValidated: isValidatedOnDiscord } = useIsProfileValidated(user, [AccountType.Discord])
  const [isDiscordChanging, setIsDiscordChanging] = useState(false)
  const [isSettingsOpened, setIsSettingsOpened] = useState(false)
  const [showDiscordConnect, setShowDiscordConnect] = useState(false)
  const { isDiscordActive, refetch: refetchIsDiscordActive } = useIsDiscordActive()

  const handleOnClose = () => {
    onClose()
    setTimeout(() => {
      setIsSettingsOpened(false)
      setShowDiscordConnect(false)
    }, 500)
  }

  useClickOutside('.NotificationsFeed', isOpen, handleOnClose)
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

    setIsSubscribing(true)
    await PushAPI.channels.unsubscribe({
      signer,
      channelAddress: getCaipAddress(PUSH_CHANNEL_ID, chainId),
      userAddress: getCaipAddress(user, chainId),
      onSuccess: onSubscriptionChangeSuccess,
      env,
    })
    setIsSubscribing(false)
  }

  const handleLoadMoreClick = () => {
    if (filteredNotifications) {
      setNotificationsPerPage(filteredNotifications.length + NOTIFICATIONS_PER_PAGE)
    }
  }

  const handleDiscordConnect = () => {
    setIsDiscordConnect(true)
    handleOnClose()
  }

  const handlePushSettingsChange = async (isEnabled: boolean) => {
    if (isEnabled) {
      await handleSubscribeUserToChannel()
    } else {
      await handleUnsubscribeUserToChannel()
    }
    setIsSettingsOpened(false)
  }

  const handleDiscordSettingsChange = async (isEnabled: boolean) => {
    if (!isValidatedOnDiscord) {
      setShowDiscordConnect(true)
      setIsSettingsOpened(false)
      return
    }
    setIsDiscordChanging(true)
    try {
      await Governance.get().updateDiscordStatus(isEnabled)
      await refetchIsDiscordActive()
    } catch (error) {
      if (isProdEnv()) {
        ErrorClient.report(`Error changing discord status`, {
          error,
          userAddress: user,
          category: ErrorCategory.Discord,
        })
      } else {
        console.error('Error changing discord status', error)
      }
    }
    setIsDiscordChanging(false)
  }

  const filteredNotifications = userNotifications?.slice(0, notificationsPerPage)
  const hasNotifications = filteredNotifications && filteredNotifications.length > 0
  const showNotifications = isSubscribed && !isLoadingNotifications && hasNotifications && !isSettingsOpened
  const showLoadMoreButton = filteredNotifications?.length !== userNotifications?.length
  const unsubscribedKey = isSubscribing ? 'subscribing' : 'unsubscribed'
  const isLoading =
    isLoadingSubscriptions ||
    isRefetchingSubscriptions ||
    isRefetchingNotifications ||
    (isSubscribed && isLoadingNotifications)
  const showUnsubscribedView = !isSubscribed && !isValidatedOnDiscord && !showDiscordConnect
  const showEmptyView =
    isSubscribed && !isLoadingNotifications && !hasNotifications && !isSettingsOpened && !showDiscordConnect
  const showSettingsButton = (isSubscribed || isValidatedOnDiscord) && !isSettingsOpened && !showDiscordConnect
  const showDiscordView = isValidatedOnDiscord && !isSubscribed && !isSettingsOpened

  return (
    <div
      className={classNames(
        'NotificationsFeed',
        isOpen && 'NotificationsFeed--visible',
        isLoading && 'NotificationsFeed--loading'
      )}
    >
      <div className="NotificationsFeed__Header">
        {isSettingsOpened && (
          <div className="NotificationsFeed__BackButton" onClick={() => setIsSettingsOpened(false)}>
            <ChevronLeft color="var(--black-600)" />
          </div>
        )}
        <Text color="secondary" size="sm" className="NotificationsFeed__Title">
          {t(isSettingsOpened ? 'navigation.notifications.settings.title' : 'navigation.notifications.title')}
        </Text>
        {showSettingsButton && (
          <button className="NotificationsFeed__SettingsButton" onClick={() => setIsSettingsOpened(true)}>
            {t('navigation.notifications.settings.button')}
          </button>
        )}
      </div>
      {!isLoading && (
        <div className="NotificationsFeed__Content">
          {showUnsubscribedView && (
            <UnsubscribedView
              unsubscribedKey={unsubscribedKey}
              isSubscribing={isSubscribing}
              handleSubscribeUserToChannel={handleSubscribeUserToChannel}
              handleDiscordConnect={() => setShowDiscordConnect(true)}
            />
          )}
          {showDiscordConnect && (
            <DiscordConnectView onJoinDiscord={handleDiscordConnect} onAlreadyJoined={handleDiscordConnect} />
          )}
          {showDiscordView && (
            <DiscordView isSubscribing={isSubscribing} onSubscribeUserToChannel={handleSubscribeUserToChannel} />
          )}
          {showEmptyView && <EmptyView />}
          {showNotifications && (
            <ListView
              notifications={filteredNotifications}
              lastNotificationIdIndex={lastNotificationIdIndex}
              showLoadMoreButton={showLoadMoreButton}
              onLoadMoreClick={handleLoadMoreClick}
            />
          )}
          {isSettingsOpened && (
            <SettingsView
              isPushEnabled={isSubscribed}
              isDiscordEnabled={isDiscordActive}
              onPushChange={handlePushSettingsChange}
              onDiscordChange={handleDiscordSettingsChange}
              isLoading={isSubscribing || isDiscordChanging}
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
