import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { EMPTY_DELEGATION } from '../clients/SnapshotGraphqlTypes'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { getDelegations } from '../entities/Snapshot/utils'

export default function useDelegation(address?: string | null) {
  return useAsyncMemo(
    async () => {
      return await getDelegations(address)
    },
    [SNAPSHOT_SPACE, address],
    { initialValue: EMPTY_DELEGATION, callWithTruthyDeps: true }
  )
}
