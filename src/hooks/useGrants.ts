import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { GrantsResponse } from '../entities/Proposal/types'

export default function useGrants() {
  const [response, state] = useAsyncMemo(async () => {
    return Governance.get().getGrants()
  }, [])

  return {
    grants: (response || []) as GrantsResponse,
    isLoadingGrants: state.loading,
  }
}
