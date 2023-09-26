import { useEffect, useMemo, useState } from 'react'

import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Governance } from '../clients/Governance'
import { isSameAddress } from '../entities/Snapshot/utils'
import { DEFAULT_QUERY_STALE_TIME } from '../hooks/constants'
import { useClickOutside } from '../hooks/useClickOutside'
import useFormatMessage from '../hooks/useFormatMessage'
import { CHAIN_ID, CHANNEL_ADDRESS, ENV, Notification, getCaipAddress } from '../utils/notifications'

import FullWidthButton from './Common/FullWidthButton'
import Heading from './Common/Typography/Heading'
import Text from './Common/Typography/Text'
import NotificationBellActive from './Icon/NotificationBellActive'
import NotificationBellInactive from './Icon/NotificationBellInactive'
import PeaceCircle from './Icon/PeaceCircle'
import NotificationItem from './Notifications/NotificationItem'

import './NotificationFeed.css'

const NOTIFICATIONS_PER_PAGE = 5

export default function NotificationFeed() {
  const t = useFormatMessage()
  const [isOpen, setOpen] = useState(false)
  const [user, userState] = useAuthContext()
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])

  useClickOutside('.NotificationFeed__Content', isOpen, () => setOpen(false))

  const {
    data: subscriptions,
    refetch: refetchSubscriptions,
    isLoading: isLoadingSubscriptions,
    isRefetching: isRefetchingSubscriptions,
  } = useQuery({
    queryKey: [`subscriptions#${user}`],
    queryFn: () =>
      user ? PushAPI.user.getSubscriptions({ user: getCaipAddress(user, CHAIN_ID), env: ENV.STAGING }) : null,
    enabled: !!user,
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const isSubscribed = useMemo(
    () => !!subscriptions?.find((item: { channel: string }) => isSameAddress(item.channel, CHANNEL_ADDRESS)),
    [subscriptions]
  )
  const {
    data: userNotifications,
    isLoading: isLoadingNotifications,
    isRefetching: isRefetchingNotifications,
  } = useQuery({
    queryKey: [`notifications#${user}`],
    queryFn: () => (user ? Governance.get().getUserNotifications(user) : null),
    enabled: !!user && isSubscribed,
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const handleSubscribeUserToChannel = async () => {
    if (!user || !userState.provider) {
      return
    }

    const signer = new Web3Provider(userState.provider).getSigner()

    await PushAPI.channels.subscribe({
      signer,
      channelAddress: getCaipAddress(CHANNEL_ADDRESS, CHAIN_ID),
      userAddress: getCaipAddress(user, CHAIN_ID),
      onSuccess: () => {
        refetchSubscriptions()
      },
      env: ENV.STAGING,
    })
  }

  const handleUnsubscribeUserToChannel = async () => {
    if (!user || !userState.provider) {
      return
    }

    const signer = new Web3Provider(userState.provider).getSigner()

    await PushAPI.channels.unsubscribe({
      signer,
      channelAddress: getCaipAddress(CHANNEL_ADDRESS, CHAIN_ID),
      userAddress: getCaipAddress(user, CHAIN_ID),
      onSuccess: () => refetchSubscriptions(),
      env: ENV.STAGING,
    })
  }

  const handleLoadMoreClick = () => {
    const notifications = userNotifications?.slice(
      0,
      filteredNotifications.length + NOTIFICATIONS_PER_PAGE
    ) as unknown as Notification[]
    setFilteredNotifications(notifications)
  }

  useEffect(() => {
    if (filteredNotifications.length === 0 && userNotifications && userNotifications?.length > 0) {
      const notifications = userNotifications.slice(0, NOTIFICATIONS_PER_PAGE) as unknown as Notification[]
      setFilteredNotifications(notifications)
    }
  }, [userNotifications, filteredNotifications.length])

  const hasNotifications = filteredNotifications && filteredNotifications.length > 0
  const showLoadMoreButton = isSubscribed && !isLoadingNotifications && hasNotifications

  return (
    <>
      <button
        className={classNames('NotificationFeed__Button', isOpen && 'NotificationFeed__Button--active')}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open notifications"
      >
        {isOpen ? <NotificationBellActive /> : <NotificationBellInactive />}
      </button>
      <div className={classNames('NotificationFeed__Content', isOpen && 'NotificationFeed__Content--visible')}>
        <div className="NotificationFeed__Header">
          <Text color="secondary" size="sm" className="NotificationFeed__Title">
            {t('navigation.notifications.title')}
          </Text>
          {isSubscribed && (
            <button className="NotificationFeed__OptOut" onClick={handleUnsubscribeUserToChannel}>
              {t('navigation.notifications.opt_out')}
            </button>
          )}
        </div>
        {!isSubscribed && (
          <div className="NotificationFeed__UnsubscribedView">
            <NotificationBellInactive size={124} />
            <Heading size="sm">{`Don't miss a beat`}</Heading>
            <Text>{t('navigation.notifications.unsubscribed.description')}</Text>
            <Button size="small" primary disabled={isSubscribed} onClick={handleSubscribeUserToChannel}>
              {t('navigation.notifications.unsubscribed.button')}
            </Button>
          </div>
        )}
        {isSubscribed && !isLoadingNotifications && !hasNotifications && (
          <div className="NotificationFeed__EmptyView">
            <PeaceCircle />
            <Text color="secondary" weight="medium">
              {t('navigation.notifications.empty')}
            </Text>
          </div>
        )}
        {showLoadMoreButton && (
          <div>
            <div className="NotificationFeed__List">
              {filteredNotifications?.map((notification) => (
                <NotificationItem key={notification.payload_id} notification={notification} />
              ))}
            </div>
            {filteredNotifications.length !== userNotifications?.length && (
              <div className="NotificationFeed__LoadMoreButtonContainer">
                <FullWidthButton onClick={handleLoadMoreClick}>
                  {t('navigation.notifications.load_more')}
                </FullWidthButton>
              </div>
            )}
          </div>
        )}
        {(isLoadingSubscriptions ||
          isRefetchingSubscriptions ||
          isRefetchingNotifications ||
          (isSubscribed && isLoadingNotifications)) && <Loader active />}
      </div>
    </>
  )
}
