import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql, VpDistribution } from '../clients/SnapshotGraphql'

export const EMPTY_DISTRIBUTION = {
  totalVp: 0,
  ownVp: 0,
  wManaVp: 0,
  landVp: 0,
  estateVp: 0,
  manaVp: 0,
  namesVp: 0,
  delegatedVp: 0,
  linkedWearablesVp: 0,
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
