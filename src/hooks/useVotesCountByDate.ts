import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { getMultipleVotesSegmentation, getVotesArrayByAddress } from '../entities/Votes/utils'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useVotesCountByDate(start: Date, end: Date) {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`votesCount#${start}#${end}`],
    queryFn: async () => {
      return await Governance.get().getAllVotesBetweenDates(start, end)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const parsedVotes = votes ? getVotesArrayByAddress(votes) : undefined
  const { highQualityVotes } = getMultipleVotesSegmentation(parsedVotes)

  const votesCount = Object.values(highQualityVotes).reduce((acc, votes) => {
    return acc + votes.length
  }, 0)

  return {
    votesCount,
    isLoadingVotesCount: isLoading,
  }
}
