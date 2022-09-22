import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { PickedByResult, SnapshotSubgraph } from '../clients/SnapshotSubgraph'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

const INITIAL_VALUE: PickedByResult[] = []

function usePickedBy(addresses: string[]) {
  const [pickedByResults, state] = useAsyncMemo(
    async () => {
      try {
        return await SnapshotSubgraph.get().getPickedBy({ address: addresses, space: SNAPSHOT_SPACE })
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [],
    { initialValue: INITIAL_VALUE }
  )

  return { pickedByResults, isLoadingPickedBy: state.loading }
}

export default usePickedBy
