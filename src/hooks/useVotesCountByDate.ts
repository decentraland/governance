import { useQuery } from '@tanstack/react-query'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'

export default function useVotesCountByDate(start: Date, end: Date) {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`votesCount#${start}#${end}`],
    queryFn: async () => {
      return await SnapshotGraphql.get().getVotes(start, end)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    votesCount: votes?.length,
    isLoadingVotesCount: isLoading,
  }
}
