import { SnapshotService } from '../../services/SnapshotService'

export async function pingSnapshot() {
  await SnapshotService.ping()
}
