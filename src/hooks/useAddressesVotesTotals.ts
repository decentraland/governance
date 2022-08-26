import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { max } from 'lodash'

import { SnapshotGraphqlClient } from '../api/SnapshotGraphqlClient'

export type VoteHistory = { lastVoted: number; timesVoted: number }

export default function useAddressesVotesTotals(addresses: string[]) {
  const [addressesVotesTotals, state] = useAsyncMemo(
    async () => {
      const addressesVotesByDate = await SnapshotGraphqlClient.get().getAddressesVotesByDate(addresses)
      const aggregatedVotes: Record<string, VoteHistory> = {}
      addressesVotesByDate.map((voteByDate) => {
        const voter = voteByDate.voter.toLowerCase()
        if (aggregatedVotes[voter]) {
          aggregatedVotes[voter].timesVoted += 1
          aggregatedVotes[voter].lastVoted = max([aggregatedVotes[voter].lastVoted, voteByDate.created]) || 0
        } else {
          aggregatedVotes[voter] = {
            lastVoted: voteByDate.created,
            timesVoted: 1,
          }
        }
      })
      return aggregatedVotes
    },
    [JSON.stringify(addresses)],
    { initialValue: {} as Record<string, VoteHistory>, callWithTruthyDeps: true }
  )

  return {
    addressesVotesTotals,
    isLoadingAddressesVotesTotals: state.loading,
  }
}
