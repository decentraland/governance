import React, { useMemo, useState } from 'react'

import { Web3Provider } from '@ethersproject/providers'
import * as PushAPI from '@pushprotocol/restapi'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Governance } from '../clients/Governance'
import { DEFAULT_QUERY_STALE_TIME } from '../hooks/constants'
import { useClickOutside } from '../hooks/useClickOutside'
import { CHAIN_ID, CHANNEL_ADDRESS, ENV, getCaipAddress } from '../utils/notifications'

import FullWidthButton from './Common/FullWidthButton'
import Heading from './Common/Typography/Heading'
import Text from './Common/Typography/Text'
import NotificationBellActive from './Icon/NotificationBellActive'
import NotificationBellInactive from './Icon/NotificationBellInactive'

import './NotificationFeed.css'

export default function NotificationFeed() {
  const [isOpen, setOpen] = useState(false)
  const [user, userState] = useAuthContext()

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

  // TODO: Type subscriptions query
  const isSubscribed = useMemo(
    () => !!subscriptions?.find((item: any) => item.channel === CHANNEL_ADDRESS),
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
            Notifications
          </Text>
          {isSubscribed && (
            <button className="NotificationFeed__OptOut" onClick={handleUnsubscribeUserToChannel}>
              Opt out
            </button>
          )}
        </div>
        {!isSubscribed && (
          <div className="NotificationFeed__UnsubscribedView">
            <NotificationBellInactive size={124} />
            <Heading size="sm">{`Don't miss a beat`}</Heading>
            <Text>We rely on a 3rd party service that you’ll have to opt-in to in order to proceed.</Text>
            <Button size="small" primary disabled={isSubscribed} onClick={handleSubscribeUserToChannel}>
              Activate notifications
            </Button>
          </div>
        )}
        {!isLoadingNotifications && isSubscribed && userNotifications && (
          <div>
            {userNotifications?.map((notification) => (
              <div key={notification.payload_id} className="NotificationFeed__Item">
                <Text>{notification.payload.data.asub}</Text>
                <Text>{notification.payload.data.amsg}</Text>
              </div>
            ))}
            <div className="NotificationFeed__LoadMoreButtonContainer">
              <FullWidthButton>Load more</FullWidthButton>
            </div>
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
