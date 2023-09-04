import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { FIVE_MINUTES_MS } from './constants'
import { useSortingByKey } from './useSortingByKey'

export default function useTopVoters(start: Date, end: Date, limit?: number) {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`topVoters#${start}#${end}`],
    queryFn: async () => {
      return await Governance.get().getTopVoters(start, end, limit)
    },
    staleTime: FIVE_MINUTES_MS,
  })

  const { sorted, isDescendingSort, changeSort } = useSortingByKey(votes ?? [], 'votes')

  return {
    topVoters: sorted,
    isLoadingTopVoters: isLoading,
    isDescendingSort,
    changeSort,
  }
}
