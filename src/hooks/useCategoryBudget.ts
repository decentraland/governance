import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { CategoryBudget } from '../entities/Budget/types'
import { ProposalGrantCategory } from '../entities/Grant/types'

const EMPTY_CATEGORY_BUDGET: CategoryBudget = {
  total: 0,
  allocated: 0,
  available: 0,
}

export default function useCategoryBudget(category?: ProposalGrantCategory | null) {
  const { data } = useQuery({
    queryKey: [`categoryBudget#${category}`],
    queryFn: async () => (category ? await Governance.get().getCategoryBudget(category) : EMPTY_CATEGORY_BUDGET),
    staleTime: 3.6e6, // 1 hour
  })

  const totalCategoryBudget = data?.total ?? EMPTY_CATEGORY_BUDGET.total
  const availableCategoryBudget = data?.available ?? EMPTY_CATEGORY_BUDGET.available
  const allocatedCategoryBudget = data?.allocated ?? EMPTY_CATEGORY_BUDGET.allocated

  return {
    totalCategoryBudget,
    availableCategoryBudget,
    allocatedCategoryBudget,
  }
}
