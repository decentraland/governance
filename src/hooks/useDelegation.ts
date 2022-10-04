import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { EMPTY_DELEGATION } from '../clients/SnapshotGraphqlTypes'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { getLatestDelegations } from '../entities/Snapshot/utils'

export default function useDelegation(address?: string | null) {
  return useAsyncMemo(
    async () => {
      return await getLatestDelegations(address)
    },
    [SNAPSHOT_SPACE, address],
    { initialValue: EMPTY_DELEGATION, callWithTruthyDeps: true }
  )
}
