import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphqlClient } from '../api/SnapshotGraphqlClient'

export default function useVotesCountByDate(start: Date, end: Date) {
  const [votes, state] = useAsyncMemo(
    async () => {
      return await SnapshotGraphqlClient.get().getVotes(start, end)
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
