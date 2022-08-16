import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Snapshot } from './../api/Snapshot'

export default function useVotesCountByDate(start: Date, end: Date) {
  const [votes, state] = useAsyncMemo(
    async () => {
      return await Snapshot.get().getVotes(start, end)
    },
    [start, end],
    {
      callWithTruthyDeps: true,
    }
  )

  return {
    votesCount: votes?.length,
    isLoadingVotesCount: state.loading,
  }
}
