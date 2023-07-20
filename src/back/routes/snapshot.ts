import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotService } from '../../services/SnapshotService'

export default routes((router) => {
  router.post('/snapshot/space-status', handleAPI(getSnapshotStatusAndSpace))
  router.post('/snapshot/votes', handleAPI(getAddressesVotes))
})

async function getSnapshotStatusAndSpace(req: Request<{ spaceName?: string }>) {
  const { spaceName } = req.body
  return await SnapshotService.getSnapshotStatusAndSpace(spaceName)
}

async function getAddressesVotes(req: Request<{ spaceName?: string }>) {
  const { addresses } = req.body
  return await SnapshotService.getAddressesVotes(addresses)
}
