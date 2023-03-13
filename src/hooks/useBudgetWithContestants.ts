import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { NULL_CONTESTED_BUDGET } from '../entities/Budget/types'

export default function useBudgetWithContestants(id?: string) {
  const [budgetWithContestants, state] = useAsyncMemo(
    async () => {
      if (!id || id.length < 1) return NULL_CONTESTED_BUDGET
      return await Governance.get().getBudgetWithContestants(id)
    },
    [id],
    { initialValue: NULL_CONTESTED_BUDGET }
  )

  return {
    budgetWithContestants,
    isLoadingBudgetWithContestants: state.loading,
  }
}
