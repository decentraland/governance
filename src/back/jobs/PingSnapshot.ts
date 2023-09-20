import { SNAPSHOT_STATUS_ENABLED } from '../../constants'
import { SnapshotService } from '../../services/SnapshotService'

export async function pingSnapshot() {
  if (SNAPSHOT_STATUS_ENABLED) {
    await SnapshotService.ping()
  }
}
