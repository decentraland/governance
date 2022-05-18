import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { Scores } from '../entities/Votes/utils'

export default function useVotingPowerBalanceList(addresses?: string[] | null) {
  const [votingPower, state] = useAsyncMemo(
    async () => {
      return await Snapshot.get().getVotingPowerList(addresses, SNAPSHOT_SPACE)
    },
    [JSON.stringify(addresses)],
    { initialValue: {} as Scores, callWithTruthyDeps: true }
  )

  return {
    votingPower,
    isLoadingVotingPower: state.loading,
  }
}
