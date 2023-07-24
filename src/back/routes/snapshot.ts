import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotService } from '../../services/SnapshotService'

export default routes((router) => {
  router.post('/snapshot/status-space', handleAPI(getStatusAndSpace))
  router.post('/snapshot/votes', handleAPI(getAddressesVotes))
})

async function getStatusAndSpace(req: Request<{ spaceName?: string }>) {
  const { spaceName } = req.body
  return await SnapshotService.getStatusAndSpace(spaceName)
}

async function getAddressesVotes(req: Request<{ spaceName?: string }>) {
  const { addresses } = req.body
  return await SnapshotService.getAddressesVotes(addresses)
}
