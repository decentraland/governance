import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotService } from '../../services/SnapshotService'

export default routes((router) => {
  router.get('/snapshot/status-space/:spaceName', handleAPI(getStatusAndSpace))
  router.post('/snapshot/votes', handleAPI(getAddressesVotes))
  router.get('/snapshot/proposal-votes/:id', handleAPI(getProposalVotes))
})

async function getStatusAndSpace(req: Request<{ spaceName?: string }>) {
  const { spaceName } = req.params
  return await SnapshotService.getStatusAndSpace(spaceName)
}

async function getAddressesVotes(req: Request<{ spaceName?: string }>) {
  const { addresses } = req.body
  return await SnapshotService.getAddressesVotes(addresses)
}

async function getProposalVotes(req: Request<{ id?: string }>) {
  const { id } = req.params
  if (!id || id.length === 0) {
    return []
  }
  return await SnapshotService.getProposalVotes(id)
}
