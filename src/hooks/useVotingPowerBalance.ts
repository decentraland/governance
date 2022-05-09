import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

export const MINIMUM_VP_REQUIRED_TO_VOTE = 1

export default function useVotingPowerBalance(address?: string | null) {
  const [votingPower, state] = useAsyncMemo(
    async () => {
      return await Snapshot.get().getVotingPower(address, SNAPSHOT_SPACE)
    },
    [address],
    { initialValue: 0, callWithTruthyDeps: true }
  )
  const hasEnoughToVote = !!votingPower && votingPower > MINIMUM_VP_REQUIRED_TO_VOTE && !state.loading

  return {
    votingPower,
    isLoadingVotingPower: state.loading,
    hasEnoughToVote,
  }
}
