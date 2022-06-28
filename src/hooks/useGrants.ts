import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'
import { GrantAttributes, GrantWithUpdateAttributes } from '../entities/Proposal/types'

export default function useGrants() {
  const [response, state] = useAsyncMemo(async () => {
    return Governance.get().getGrants()
  }, [])

  return {
    grants: (response || []) as { current: GrantWithUpdateAttributes[]; past: GrantAttributes[] },
    isLoadingGrants: state.loading,
  }
}
