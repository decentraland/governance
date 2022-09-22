import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { GrantsResponse } from '../entities/Proposal/types'

export default function useGrantsByUser(address: string, coauthoring?: boolean) {
  const [grants] = useAsyncMemo(
    async () => await Governance.get().getGrantsByUser(address, coauthoring),
    [address, coauthoring],
    { initialValue: { current: [], past: [], total: 0 } as GrantsResponse }
  )

  return useMemo(() => [...grants.current, ...grants.past], [grants])
}
