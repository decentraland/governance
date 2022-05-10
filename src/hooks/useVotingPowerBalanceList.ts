import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { useMemo } from 'react'

import { Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { MINIMUM_VP_REQUIRED_TO_VOTE } from './useVotingPowerBalance'

export default function useVotingPowerBalanceList(addresses?: string[] | null) {
  const [votingPower, state] = useAsyncMemo(
    async () => {
      return await Snapshot.get().getVotingPowerList(addresses, SNAPSHOT_SPACE)
    },
    [JSON.stringify(addresses)],
    { initialValue: {} as Record<string, number>, callWithTruthyDeps: true }
  )

  const hasEnoughToVote = useMemo(() => {
    if (state.loading) {
      return {} as Record<string, boolean>
    }

    const enoughVP: Record<string, boolean> = {}
    for (const key of Object.keys(votingPower)) {
      enoughVP[key] = votingPower[key] > MINIMUM_VP_REQUIRED_TO_VOTE
    }

    return enoughVP
  }, [state.loading])

  return {
    votingPower,
    isLoadingVotingPower: state.loading,
    hasEnoughToVote,
  }
}
