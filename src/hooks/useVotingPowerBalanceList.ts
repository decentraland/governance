import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { ScoreDetail, Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'


export default function useVotingPowerBalanceList(addresses: string[]) {
  const [votingPower, state] = useAsyncMemo(
    async () => {
      return await Snapshot.get().getLatestScores(SNAPSHOT_SPACE, addresses)
    },
    [JSON.stringify(addresses)],
    { initialValue: {} as Record<string, ScoreDetail>, callWithTruthyDeps: true }
  )

  return {
    votingPower,
    isLoadingVotingPower: state.loading,
  }
}
