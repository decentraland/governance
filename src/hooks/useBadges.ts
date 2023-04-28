import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { NULL_USER_BADGES } from '../entities/Badges/types'

export default function useBadges(address?: string) {
  const [response, state] = useAsyncMemo(
    async () => {
      if (!address) return NULL_USER_BADGES
      return await Governance.get().getBadges(address)
    },
    [address],
    { initialValue: NULL_USER_BADGES }
  )

  return {
    badges: response,
    isLoadingBadges: state.loading,
  }
}
