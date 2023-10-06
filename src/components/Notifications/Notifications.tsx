import { useMemo, useState } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import * as PushAPI from '@pushprotocol/restapi'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { Governance } from '../../clients/Governance'
import { PUSH_CHANNEL_ID } from '../../constants'
import { isSameAddress } from '../../entities/Snapshot/utils'
import { DEFAULT_QUERY_STALE_TIME } from '../../hooks/constants'
import useFormatMessage from '../../hooks/useFormatMessage'
import { getCaipAddress, getPushNotificationsEnv } from '../../utils/notifications'
import NotificationBellActive from '../Icon/NotificationBellActive'
import NotificationBellInactive from '../Icon/NotificationBellInactive'

import './Notifications.css'
import NotificationsFeed from './NotificationsFeed'

export default function Notifications() {
  const t = useFormatMessage()
  const [user, userState] = useAuthContext()
  const [isOpen, setOpen] = useState(false)
  const chainId = userState.chainId || ChainId.ETHEREUM_GOERLI
  const hasNewNotifications = false // TODO: Integrate this
  const lastNotificationId = 8403736 // TODO: Integrate this
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
  })

  console.log('u', userNotifications)
  console.log('s', subscriptions, PUSH_CHANNEL_ID)

  return (
    <>
      <div>
        <button
          className={classNames('Notifications__Button', isOpen && 'Notifications__Button--active')}
          onClick={() => setOpen((prev) => !prev)}
          aria-label={t('navigation.notifications.button_label')}
        >
          {isOpen ? <NotificationBellActive /> : <NotificationBellInactive />}
          {hasNewNotifications && !isOpen && (
            <div className="Notifications__DotOuterCircle">
              <div className="Notifications__DotInnerCircle" />
            </div>
          )}
        </button>
      </div>
      <NotificationsFeed
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        userNotifications={userNotifications}
        onSubscriptionChangeSuccess={refetchSubscriptions}
        lastNotificationId={lastNotificationId}
        isSubscribed={isSubscribed}
        isLoadingNotifications={isLoadingNotifications}
        isRefetchingNotifications={isRefetchingNotifications}
        isLoadingSubscriptions={isLoadingSubscriptions}
        isRefetchingSubscriptions={isRefetchingSubscriptions}
      />
    </>
  )
}
