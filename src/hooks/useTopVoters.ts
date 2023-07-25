import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { VOTES_VP_THRESHOLD } from '../constants'

import { FIVE_MINUTES_MS } from './constants'
import { useSortingByKey } from './useSortingByKey'

type Voters = {
  address: string
  votes: number
}

export default function useTopVoters(start: Date, end: Date, limit: number) {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`topVoters#${start}#${end}`],
    queryFn: async () => {
      const votes = await Governance.get().getAllVotesBetweenDates(start, end)
      const votesByUser = votes
        .filter((vote) => vote.vp && vote.vp > VOTES_VP_THRESHOLD)
        .reduce((acc, vote) => {
          const address = vote.voter.toLowerCase()
          acc[address] = (acc[address] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      return Object.entries(votesByUser).map<Voters>(([address, votes]) => ({ address, votes }))
    },
    staleTime: FIVE_MINUTES_MS,
  })

  const { sorted, isDescendingSort, changeSort } = useSortingByKey(votes ?? [], 'votes')

  return {
    topVoters: sorted.slice(0, limit),
    isLoadingTopVoters: isLoading,
    isDescendingSort,
    changeSort,
  }
}
