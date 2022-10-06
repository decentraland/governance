import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { VpDistribution } from '../clients/SnapshotGraphqlTypes'

export const EMPTY_DISTRIBUTION = {
  total: 0,
  own: 0,
  wMana: 0,
  land: 0,
  estate: 0,
  mana: 0,
  names: 0,
  delegated: 0,
  l1Wearables: 0,
}

export default function useVotingPowerDistribution(address?: string | null) {
  const [vpDistribution, state] = useAsyncMemo<VpDistribution>(
    async () => {
      if (!address) return EMPTY_DISTRIBUTION
      return await SnapshotGraphql.get().getVpDistribution(address)
    },
    [address],
    { callWithTruthyDeps: true, initialValue: EMPTY_DISTRIBUTION }
  )

  return { vpDistribution: vpDistribution, isLoadingVpDistribution: state.loading }
}
