import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { NULL_CONTESTED_BUDGET } from '../entities/Budget/types'

export default function useBudgetWithContestants(id?: string) {
  const { data: budgetWithContestants, isLoading: isLoadingBudgetWithContestants } = useQuery({
    queryKey: [`budgetWithContestants#${id}`],
    queryFn: async () => {
      if (!id || id.length < 1) return NULL_CONTESTED_BUDGET
      return await Governance.get().getBudgetWithContestants(id)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    budgetWithContestants: budgetWithContestants ?? NULL_CONTESTED_BUDGET,
    isLoadingBudgetWithContestants,
  }
}
