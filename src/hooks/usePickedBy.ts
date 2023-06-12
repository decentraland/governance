import { useQuery } from '@tanstack/react-query'

import { SnapshotSubgraph } from '../clients/SnapshotSubgraph'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

function usePickedBy(addresses: string[]) {
  const { data: pickedByResults, isLoading: isLoadingPickedBy } = useQuery({
    queryKey: [`pickedBy#${SNAPSHOT_SPACE}#${addresses.join(',')}`],
    queryFn: async () => {
      try {
        return await SnapshotSubgraph.get().getPickedBy({ address: addresses, space: SNAPSHOT_SPACE })
      } catch (error) {
        console.error(error)
        return []
      }
    },
    staleTime: 3.6e6, // 1 hour
  })

  return { pickedByResults: pickedByResults ?? [], isLoadingPickedBy }
}

export default usePickedBy
