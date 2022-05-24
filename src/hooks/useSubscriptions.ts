import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useAsyncTasks from 'decentraland-gatsby/dist/hooks/useAsyncTasks'

import { Governance } from '../api/Governance'

export default function useSubscriptions() {
  const [account] = useAuthContext()
  const [subscriptions, subscriptionsState] = useAsyncMemo(() => Governance.get().getUserSubscriptions(), [account], {
    callWithTruthyDeps: true,
    initialValue: [],
  })
  const [subscribing, subscribe] = useAsyncTasks(
    async (id: string) => {
      if (account && subscriptions) {
        if (subscriptions.find((subscription) => subscription.proposal_id === id)) {
          await Governance.get().unsubscribe(id)
          subscriptionsState.set((current) => (current || []).filter((sub) => sub.proposal_id !== id))
        } else {
          const newSubscription = await Governance.get().subscribe(id)
          subscriptionsState.set((current) => [...(current || []), newSubscription])
        }
      }
    },
    [subscriptions, subscriptionsState]
  )

  return [
    subscriptions || [],
    {
      loading: subscriptionsState.loading,
      subscribing,
      subscribe,
      reload: subscriptionsState.reload,
      set: subscriptionsState.set,
    },
  ] as const
}
