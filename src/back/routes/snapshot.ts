import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotService } from '../../services/SnapshotService'

export default routes((router) => {
  return router.post('/snapshot/space-status', handleAPI(getSnapshotStatusAndSpace))
})

async function getSnapshotStatusAndSpace(req: Request<{ spaceName?: string }>) {
  const { spaceName } = req.body
  return await SnapshotService.getSnapshotStatusAndSpace(spaceName)
}
