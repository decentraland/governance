import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { ProposalGrantCategory } from '../entities/Grant/types'

export default function useCategoryBudget(category?: ProposalGrantCategory | null) {
  const [data] = useAsyncMemo(
    async () => (category ? await Governance.get().getCategoryBudget(category) : null),
    [category],
    {
      callWithTruthyDeps: true,
    }
  )

  return {
    totalCategoryBudget: data?.total || 0,
    availableCategoryBudget: data?.available || 0,
    allocatedCategoryBudget: data?.allocated || 0,
  }
}
