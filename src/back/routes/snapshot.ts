import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotVote } from '../../clients/SnapshotGraphqlTypes'
import { SnapshotService } from '../../services/SnapshotService'
import { validateAddress, validateDates, validateFields, validateProposalSnapshotId } from '../utils/validations'

export default routes((router) => {
  router.get('/snapshot/status-space/:spaceName', handleAPI(getStatusAndSpace))
  router.post('/snapshot/votes', handleAPI(getAddressesVotes))
  router.get('/snapshot/votes/:proposalSnapshotId', handleAPI(getProposalVotes))
  router.post('/snapshot/votes/all', handleAPI(getAllVotesBetweenDates))
  router.post('/snapshot/proposals', handleAPI(getProposals))
  router.post('/snapshot/proposals/pending', handleAPI(getPendingProposals))
  router.get('/snapshot/vp-distribution/:address/:proposalSnapshotId?', handleAPI(getVpDistribution))
  router.post('/snapshot/scores', handleAPI(getScores))
  router.get('/snapshot/proposal-scores/:proposalSnapshotId', handleAPI(getProposalScores))
})

async function getStatusAndSpace(req: Request<{ spaceName?: string }>) {
  const { spaceName } = req.params
  return await SnapshotService.getStatusAndSpace(spaceName)
}

async function getAddressesVotes(req: Request) {
  const { addresses } = req.body
  return await SnapshotService.getAddressesVotes(addresses)
}

async function getProposalVotes(req: Request<{ proposalSnapshotId?: string }>) {
  const { proposalSnapshotId } = req.params
  validateProposalSnapshotId(proposalSnapshotId)

  return await SnapshotService.getProposalVotes(proposalSnapshotId!)
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
  validateAddress(address)

  return await SnapshotService.getVpDistribution(address, proposalSnapshotId)
}

async function getScores(req: Request) {
  const addresses = req.body.addresses
  if (!addresses || addresses.length === 0) {
    throw new RequestError('Addresses missing', RequestError.BadRequest)
  }

  return await SnapshotService.getScores(addresses)
}

async function getProposalScores(req: Request<{ proposalSnapshotId?: string }>) {
  const { proposalSnapshotId } = req.params
  validateProposalSnapshotId(proposalSnapshotId)

  return await SnapshotService.getProposalScores(proposalSnapshotId!)
}
