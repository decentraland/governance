import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

import { Snapshot } from './../api/Snapshot'

import { useSortingByKey } from './useSortingByKey'

type Voters = {
  address: string
  votes: number
}

export default function useTopVoters(start: Date, end: Date, limit: number) {
  const [votes, state] = useAsyncMemo(
    async () => {
      const votes = await Snapshot.get().getVotes(SNAPSHOT_SPACE, start, end)
      const votesByUser = votes.reduce((acc, vote) => {
        const address = vote.voter.toLowerCase()
        acc[address] = (acc[address] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(votesByUser).map<Voters>(([address, votes]) => ({ address, votes }))
    },
    [limit],
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
