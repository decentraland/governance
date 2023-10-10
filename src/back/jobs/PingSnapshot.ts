import { SnapshotStatusService } from '../../services/SnapshotStatusService'

export async function pingSnapshot() {
  await SnapshotStatusService.ping()
}
