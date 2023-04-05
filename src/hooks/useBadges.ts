import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'

export default function useBadges(address?: string) {
  const [response, state] = useAsyncMemo(
    async () => {
      if (!address) return []
      const badges = await Governance.get().getBadges(address)
      return badges
    },
    [address],
    { initialValue: [] }
  )

  return {
    badges: response,
    isLoadingBadges: state.loading,
  }
}
