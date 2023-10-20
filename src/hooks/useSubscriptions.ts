import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useSubscriptions() {
  const [account] = useAuthContext()
  const queryKey = `userSubscriptions#${account}`
  const { data: subscriptions, ...subscriptionsState } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      return await Governance.get().getUserSubscriptions()
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })
  const queryClient = useQueryClient()
  const { mutate: subscribe, isLoading: isSubscribing } = useMutation({
    mutationFn: async (id: string) => {
      if (account && subscriptions) {
        if (subscriptions.find((subscription) => subscription.proposal_id === id)) {
          await Governance.get().unsubscribe(id)
          return [...(subscriptions || [])].filter((sub) => sub.proposal_id !== id)
        } else {
          const newSubscription = await Governance.get().subscribe(id)
          return [...(subscriptions || []), newSubscription]
        }
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData([queryKey], data)
    },
  })

  return [
    subscriptions || [],
    {
      loading: subscriptionsState.isLoading,
      isSubscribing,
      subscribe,
      reload: subscriptionsState.refetch,
    },
  ] as const
}
