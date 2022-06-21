import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'

export default function useGrants() {
  const [response, state] = useAsyncMemo(async () => {
    return Governance.get().getGrants()
  }, [])

  return {
    grants: response?.data || [],
    isLoadingGrants: state.loading,
  }
}
