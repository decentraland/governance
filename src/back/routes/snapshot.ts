import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotVote } from '../../clients/SnapshotGraphqlTypes'
import { SnapshotService } from '../../services/SnapshotService'

export default routes((router) => {
  router.get('/snapshot/status-space/:spaceName', handleAPI(getStatusAndSpace))
  router.post('/snapshot/votes', handleAPI(getAddressesVotes))
  router.get('/snapshot/votes/:id', handleAPI(getProposalVotes))
  router.post('/snapshot/votes/all', handleAPI(getAllVotesBetweenDates))
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
    throw new RequestError('Invalid proposal id', RequestError.BadRequest)
  }
  return await SnapshotService.getProposalVotes(id)
}

async function getAllVotesBetweenDates(req: Request): Promise<SnapshotVote[]> {
  const { start, end } = req.body
  if (!start || !end) {
    throw new RequestError('Invalid dates', RequestError.BadRequest)
  }
  console.log('start', start)
  console.log('end', end)
  return await SnapshotService.getAllVotesBetweenDates(start, end)
}
