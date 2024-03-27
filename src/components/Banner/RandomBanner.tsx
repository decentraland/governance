import { useMemo } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import * as PushAPI from '@pushprotocol/restapi'
import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { PUSH_CHANNEL_ID } from '../../constants'
import { isSameAddress } from '../../entities/Snapshot/utils'
import { DEFAULT_QUERY_STALE_TIME } from '../../hooks/constants'
import useIsProfileValidated from '../../hooks/useIsProfileValidated'
import useNewsletterSubscription from '../../hooks/useNewsletterSubscription'
import { getCaipAddress, getPushNotificationsEnv } from '../../utils/notifications'

import ConnectAccountsBanner, { shouldShowConnectAccountsBanner } from './ConnectAccountsBanner'
import DelegationBanner, { shouldShowDelegationBanner } from './DelegationBanner'
import SubscriptionBanner from './SubscriptionBanner'

interface Props {
  isVisible: boolean
}

const randomNumber = new Date().valueOf()

function RandomBanner({ isVisible }: Props) {
  const { showSubscriptionBanner } = useNewsletterSubscription()
  const [user, userState] = useAuthContext()
  const { isProfileValidated, validationChecked } = useIsProfileValidated(user)
  const chainId = userState.chainId || ChainId.ETHEREUM_GOERLI
  const env = getPushNotificationsEnv(chainId)

  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
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

  const isSubscribedToPush = useMemo(
    () => !!subscriptions?.find((item: { channel: string }) => isSameAddress(item.channel, PUSH_CHANNEL_ID)),
    [subscriptions]
  )

  if (!isVisible || !validationChecked || isLoadingSubscriptions) {
    return null
  }

  if (shouldShowConnectAccountsBanner() && (!isProfileValidated || !isSubscribedToPush)) {
    return <ConnectAccountsBanner />
  }

  const delegationBanner = <DelegationBanner />
  const subscriptionBanner = <SubscriptionBanner />
  if (!showSubscriptionBanner) {
    return delegationBanner
  }
  if (!shouldShowDelegationBanner()) {
    return subscriptionBanner
  }

  return randomNumber % 2 === 0 ? delegationBanner : subscriptionBanner
}

export default RandomBanner
