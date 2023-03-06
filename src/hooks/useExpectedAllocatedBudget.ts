import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { NULL_EXPECTED_BUDGET } from '../entities/Budget/types'

export default function useExpectedAllocatedBudget() {
  const [expectedBudget, state] = useAsyncMemo(
    async () => {
      return Governance.get().getExpectedAllocatedBudget()
    },
    [],
    { initialValue: NULL_EXPECTED_BUDGET }
  )

  return {
    expectedBudget,
    isLoadingExpectedBudget: state.loading,
  }
}
