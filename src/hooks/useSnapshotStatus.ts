import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ServiceHealth, SnapshotStatus } from '../clients/SnapshotTypes'
import { SNAPSHOT_STATUS_ENABLED } from '../constants'

const PING_INTERVAL_IN_MS = 30000 // 30 seconds

function logIfNotNormal(status: SnapshotStatus) {
  if (status.scoresStatus.health !== ServiceHealth.Normal || status.graphQlStatus.health !== ServiceHealth.Normal) {
    console.log('Snapshot Status', status)
  }
}

export default function useSnapshotStatus() {
  const { data: showSnapshotStatus } = useQuery({
    queryKey: [`snapshotStatus`],
    queryFn: async () => {
      const status = await Governance.get().getSnapshotStatus()
      logIfNotNormal(status)
      return status.scoresStatus.health === ServiceHealth.Failing && SNAPSHOT_STATUS_ENABLED
    },
    refetchInterval: PING_INTERVAL_IN_MS,
  })

  return showSnapshotStatus
}
