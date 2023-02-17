import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { CategorizedGrants } from '../entities/Proposal/types'

const initialValue: CategorizedGrants = {
  current: [],
  past: [],
  total: 0,
}

export default function useGrants() {
  const [response, state] = useAsyncMemo(
    async () => {
      return Governance.get().getGrants()
    },
    [],
    { initialValue }
  )

  return {
    grants: response,
    isLoadingGrants: state.loading,
  }
}
