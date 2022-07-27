import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

export default function useVotesPerProposal(start: Date, end: Date) {
  const [votesPerProposal, state] = useAsyncMemo(
    async () => {
      // TODO: un-hardcode snapshot space
      return await Snapshot.get().getVotesPerProposal('snapshot.dcl.eth', start, end)
    },
    [],
    { initialValue: {} as Record<number, number>, callWithTruthyDeps: true }
  )
  return {
    votesPerProposal,
    isLoadingVotesPerProposal: state.loading,
  }
}
