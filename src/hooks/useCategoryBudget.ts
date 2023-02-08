import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { CurrentCategoryBudget } from '../entities/Budget/types'
import { ProposalGrantCategory } from '../entities/Grant/types'

const EMPTY_CATEGORY_BUDGET: CurrentCategoryBudget = {
  total: 0,
  allocated: 0,
  available: 0,
}

export default function useCategoryBudget(category?: ProposalGrantCategory | null) {
  const [data] = useAsyncMemo(
    async () => (category ? await Governance.get().getCategoryBudget(category) : EMPTY_CATEGORY_BUDGET),
    [category],
    {
      initialValue: EMPTY_CATEGORY_BUDGET,
      callWithTruthyDeps: true,
    }
  )

  return {
    totalCategoryBudget: data.total,
    availableCategoryBudget: data.available,
    allocatedCategoryBudget: data.allocated,
  }
}
