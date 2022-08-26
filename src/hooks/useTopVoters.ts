import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphqlClient } from '../api/SnapshotGraphqlClient'

import { useSortingByKey } from './useSortingByKey'

type Voters = {
  address: string
  votes: number
}

export default function useTopVoters(start: Date, end: Date, limit: number) {
  const [votes, state] = useAsyncMemo(
    async () => {
      const votes = await SnapshotGraphqlClient.get().getVotes(start, end)
      const votesByUser = votes.reduce((acc, vote) => {
        const address = vote.voter.toLowerCase()
        acc[address] = (acc[address] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(votesByUser).map<Voters>(([address, votes]) => ({ address, votes }))
    },
    [start, end],
    {
      initialValue: [] as Voters[],
      callWithTruthyDeps: true,
    }
  )

  const { sorted, isDescendingSort, changeSort } = useSortingByKey(votes, 'votes')

  return {
    topVoters: sorted.slice(0, limit),
    isLoadingTopVoters: state.loading,
    isDescendingSort,
    changeSort,
  }
}
