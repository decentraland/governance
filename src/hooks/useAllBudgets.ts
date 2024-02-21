import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useAllBudgets() {
  const { data: allBudgets } = useQuery({
    queryKey: ['all-budgets'],
    queryFn: () => Governance.get().getAllBudgets(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })
  return allBudgets
}

export default useAllBudgets
