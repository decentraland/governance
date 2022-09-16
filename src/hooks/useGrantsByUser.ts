import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { GrantsResponse } from '../entities/Proposal/types'

export default function useGrantsByUser(address: string, coauthoring?: boolean) {
  return useAsyncMemo(
    async () => await Governance.get().getGrantsByUser(address, coauthoring),
    [address, coauthoring],
    { initialValue: { current: [], past: [], total: 0 } as GrantsResponse }
  )
}
