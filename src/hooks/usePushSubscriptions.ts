import { useMemo } from 'react'

import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { useQuery } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { PUSH_CHANNEL_ID } from '../constants'
import { isSameAddress } from '../entities/Snapshot/utils'
import { getCaipAddress, getPushNotificationsEnv } from '../utils/notifications'

import { FIVE_MINUTES_MS } from './constants'

export default function usePushSubscriptions() {
  const [user, userState] = useAuthContext()
  const chainId = userState.chainId || ChainId.ETHEREUM_GOERLI
  const env = getPushNotificationsEnv(chainId)

  const { data: subscriptions, isLoading: isLoadingPushSubscriptions } = useQuery({
    queryKey: [`pushSubscriptions#${user}`],
    queryFn: async () => {
      if (!user) return null
      const PushAPI = await import('@pushprotocol/restapi')

      return PushAPI.user.getSubscriptions({
        user: getCaipAddress(user, chainId),
        env,
      })
    },
    enabled: !!user,
    staleTime: FIVE_MINUTES_MS,
  })

  const isSubscribedToDaoChannel = useMemo(
    () => !!subscriptions?.find((item: { channel: string }) => isSameAddress(item.channel, PUSH_CHANNEL_ID)),
    [subscriptions]
  )

  return {
    isSubscribedToDaoChannel,
    isLoadingPushSubscriptions,
  }
}
