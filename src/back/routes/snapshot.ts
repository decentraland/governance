import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { SnapshotProposal, SnapshotVote } from '../../clients/SnapshotGraphqlTypes'
import { SnapshotService } from '../../services/SnapshotService'

export default routes((router) => {
  router.get('/snapshot/status-space/:spaceName', handleAPI(getStatusAndSpace))
  router.post('/snapshot/votes', handleAPI(getAddressesVotes))
  router.get('/snapshot/votes/:id', handleAPI(getProposalVotes))
  router.post('/snapshot/votes/all', handleAPI(getAllVotesBetweenDates))
  router.post('/snapshot/proposals', handleAPI(getProposals))
  router.post('/snapshot/proposals/pending', handleAPI(getPendingProposals))
  router.get('/snapshot/vp-distribution/:address/:proposalSnapshotId?', handleAPI(getVpDistribution))
})

async function getStatusAndSpace(req: Request<{ spaceName?: string }>) {
  const { spaceName } = req.params
  return await SnapshotService.getStatusAndSpace(spaceName)
}

async function getAddressesVotes(req: Request) {
  const { addresses } = req.body
  return await SnapshotService.getAddressesVotes(addresses)
}

async function getProposalVotes(req: Request<{ id?: string }>) {
  const { id } = req.params
  validateProposalId(id)
  return await SnapshotService.getProposalVotes(id!)
}

async function getAllVotesBetweenDates(req: Request): Promise<SnapshotVote[]> {
  const { start, end } = req.body
  validateDates(start, end)

  return await SnapshotService.getAllVotesBetweenDates(new Date(start), new Date(end))
}

async function getProposals(req: Request) {
  const { start, end, fields } = req.body
  validateDates(start, end)
  validateFields(fields)

  return await SnapshotService.getProposals(new Date(start), new Date(end), fields)
}

async function getPendingProposals(req: Request) {
  const { start, end, fields, limit } = req.body
  validateDates(start, end)
  validateFields(fields)

  return await SnapshotService.getPendingProposals(new Date(start), new Date(end), fields, limit)
}

async function getVpDistribution(req: Request<{ address: string; proposalSnapshotId?: string }>) {
  const { address, proposalSnapshotId } = req.params
  if (!address || !isEthereumAddress(address)) {
    throw new RequestError('Invalid address', RequestError.BadRequest)
  }
  validateProposalId(proposalSnapshotId, 'optional')
  return await SnapshotService.getVpDistribution(address, proposalSnapshotId)
}

function validateDates(start?: string, end?: string) {
  if (!start || !(start.length > 0) || !end || !(end.length > 0)) {
    throw new RequestError('Invalid dates', RequestError.BadRequest)
  }
}

function validateFields(fields: unknown) {
  if (!fields || !Array.isArray(fields) || fields.length === 0) {
    throw new RequestError('Invalid fields', RequestError.BadRequest)
  }
  const validFields: (keyof SnapshotProposal)[] = [
    'id',
    'ipfs',
    'author',
    'created',
    'type',
    'title',
    'body',
    'choices',
    'start',
    'end',
    'snapshot',
    'state',
    'link',
    'scores',
    'scores_by_strategy',
    'scores_state',
    'scores_total',
    'scores_updated',
    'votes',
    'space',
    'strategies',
    'discussion',
    'plugins',
  ]
  if (!fields.every((field) => validFields.includes(field))) {
    throw new RequestError('Invalid fields', RequestError.BadRequest)
  }
}

function validateProposalId(id?: string, optional: 'optional' | 'required' = 'required') {
  if ((!optional && !id) || (optional && !!id && id.length === 0)) {
    throw new RequestError('Invalid proposal id', RequestError.BadRequest)
  }
}
