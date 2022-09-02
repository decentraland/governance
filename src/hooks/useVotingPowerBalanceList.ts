import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { DetailedScores } from '../clients/SnapshotGraphql'
import { getScores } from '../entities/Votes/utils'

export default function useVotingPowerBalanceList(addresses: string[]) {
  const [votingPower, state] = useAsyncMemo(
    async () => {
      return await getScores(addresses)
    },
    [JSON.stringify(addresses)],
    { initialValue: {} as DetailedScores, callWithTruthyDeps: true }
  )

  return {
    votingPower,
    isLoadingVotingPower: state.loading,
  }
}
