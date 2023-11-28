import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { ONE_DAY_MS } from './constants'
import { useSortingByKey } from './useSortingByKey'

export default function useTopVoters() {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`topVoters`],
    queryFn: async () => {
      return await Governance.get().getTopVotersForLast30Days()
    },
    staleTime: ONE_DAY_MS,
  })

  const { sorted, isDescendingSort, changeSort } = useSortingByKey(votes ?? [], 'votes')

  return {
    topVoters: sorted,
    isLoadingTopVoters: isLoading,
    isDescendingSort,
    changeSort,
  }
}
