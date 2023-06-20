import { useQuery } from '@tanstack/react-query'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useVotesCountByDate(start: Date, end: Date) {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`votesCount#${start}#${end}`],
    queryFn: async () => {
      return await SnapshotGraphql.get().getVotes(start, end)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    votesCount: votes?.length,
    isLoadingVotesCount: isLoading,
  }
}
