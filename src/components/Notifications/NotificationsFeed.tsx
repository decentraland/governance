import { useEffect, useMemo, useState } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Governance } from '../../clients/Governance'
import { PUSH_CHANNEL_ID } from '../../constants'
import { isSameAddress } from '../../entities/Snapshot/utils'
import { DEFAULT_QUERY_STALE_TIME } from '../../hooks/constants'
import { useClickOutside } from '../../hooks/useClickOutside'
import useFormatMessage from '../../hooks/useFormatMessage'
import { Notification } from '../../shared/types/notifications'
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
}

export default function NotificationsFeed({ isOpen, onClose }: Props) {
  const t = useFormatMessage()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [user, userState] = useAuthContext()
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])

  useClickOutside('.NotificationsFeed', isOpen, onClose)
  const chainId = userState.chainId || ChainId.ETHEREUM_GOERLI
  const env = getPushNotificationsEnv(chainId)

  const {
    data: subscriptions,
    refetch: refetchSubscriptions,
    isLoading: isLoadingSubscriptions,
    isRefetching: isRefetchingSubscriptions,
  } = useQuery({
    queryKey: [`pushSubscriptions#${user}`],
    queryFn: () =>
      user
        ? PushAPI.user.getSubscriptions({
            user: getCaipAddress(user, chainId),
            env,
          })
        : null,
    enabled: !!user,
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const isSubscribed = useMemo(
    () => !!subscriptions?.find((item: { channel: string }) => isSameAddress(item.channel, PUSH_CHANNEL_ID)),
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

    setIsSubscribing(true)
    const signer = new Web3Provider(userState.provider).getSigner()

    await PushAPI.channels.subscribe({
      signer,
      channelAddress: getCaipAddress(PUSH_CHANNEL_ID, chainId),
      userAddress: getCaipAddress(user, chainId),
      onSuccess: () => {
        refetchSubscriptions()
      },
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
      onSuccess: () => refetchSubscriptions(),
      env,
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
  const showNotifications = isSubscribed && !isLoadingNotifications && hasNotifications
  const showLoadMoreButton = filteredNotifications.length !== userNotifications?.length
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
                {filteredNotifications?.map((notification) => (
                  <NotificationItem key={notification.payload_id} notification={notification} />
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
