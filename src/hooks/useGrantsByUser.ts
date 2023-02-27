import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { CategorizedGrants } from '../entities/Proposal/types'

export default function useGrantsByUser(address: string | null, coauthoring?: boolean) {
  const initialValue: CategorizedGrants = { current: [], past: [], total: 0 }
  const [grants] = useAsyncMemo(
    async () => {
      if (!address) {
        return initialValue
      }

      return await Governance.get().getGrantsByUser(address, coauthoring)
    },
    [address, coauthoring],
    { initialValue }
  )

  return useMemo(() => [...grants.current, ...grants.past], [grants])
}
