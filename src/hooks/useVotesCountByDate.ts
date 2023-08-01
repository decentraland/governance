import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useVotesCountByDate(start: Date, end: Date) {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`votesCount#${start}#${end}`],
    queryFn: async () => {
      return await Governance.get().getAllVotesBetweenDates(start, end)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    votesCount: votes?.length,
    isLoadingVotesCount: isLoading,
  }
}
