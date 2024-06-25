import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotSubgraph } from '../clients/SnapshotSubgraph'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { getDelegations as getSnapshotDelegations } from '../entities/Snapshot/utils'
import { SnapshotService } from '../services/SnapshotService'
import { SnapshotStatusService } from '../services/SnapshotStatusService'
import {
  validateAddress,
  validateAddresses,
  validateBlockNumber,
  validateDates,
  validateProposalFields,
  validateProposalSnapshotId,
} from '../utils/validations'

export default routes((router) => {
  router.get('/snapshot/status', handleAPI(getStatus))
  router.get('/snapshot/config/:spaceName', handleAPI(getConfig))
  router.post('/snapshot/votes', handleAPI(getVotesByAddresses))
  router.get('/snapshot/votes/:proposalSnapshotId', handleAPI(getVotesByProposal))
  router.post('/snapshot/proposals', handleAPI(getProposals))
  router.post('/snapshot/proposals/pending', handleAPI(getPendingProposals))
  router.get('/snapshot/vp-distribution/:address/:proposalSnapshotId?', handleAPI(getVpDistribution))
  router.post('/snapshot/scores', handleAPI(getScores))
  router.get('/snapshot/proposal-scores/:proposalSnapshotId', handleAPI(getProposalScores))
  router.post('/snapshot/delegations', handleAPI(getDelegations))
  router.post('/snapshot/picked-by', handleAPI(getPickedBy))
})

async function getStatus() {
  return await SnapshotStatusService.getStatus()
}

async function getConfig(req: Request<{ spaceName?: string }>) {
  const { spaceName } = req.params
  return await SnapshotService.getConfig(spaceName)
}

async function getVotesByAddresses(req: Request) {
  const { addresses } = req.body
  return await SnapshotService.getVotesByAddresses(addresses)
}

async function getVotesByProposal(req: Request<{ proposalSnapshotId?: string }>) {
  const proposalSnapshotId = validateProposalSnapshotId(req.params.proposalSnapshotId)
  return await SnapshotService.getVotesByProposal(proposalSnapshotId)
}

async function getProposals(req: Request) {
  const { start, end, fields } = req.body
  const { validatedStart, validatedEnd } = validateDates(start, end)
  validateProposalFields(fields)

  return await SnapshotService.getProposals(validatedStart, validatedEnd, fields)
}

async function getPendingProposals(req: Request) {
  const { start, end, fields, limit } = req.body
  const { validatedStart, validatedEnd } = validateDates(start, end)
  validateProposalFields(fields)

  return await SnapshotService.getPendingProposals(validatedStart, validatedEnd, fields, limit)
}

async function getVpDistribution(req: Request<{ address: string; proposalSnapshotId?: string }>) {
  const { address, proposalSnapshotId } = req.params
  return await SnapshotService.getVpDistribution(validateAddress(address), proposalSnapshotId)
}

async function getScores(req: Request) {
  const addresses = req.body.addresses
  if (!addresses || addresses.length === 0) {
    throw new RequestError('Addresses missing', RequestError.BadRequest)
  }

  return await SnapshotService.getScores(addresses)
}

async function getProposalScores(req: Request<{ proposalSnapshotId?: string }>) {
  const proposalSnapshotId = validateProposalSnapshotId(req.params.proposalSnapshotId)
  return await SnapshotService.getProposalScores(proposalSnapshotId)
}

async function getDelegations(req: Request) {
  const { address, blockNumber } = req.body
  validateAddress(address)
  validateBlockNumber(blockNumber)
  return getSnapshotDelegations(address, blockNumber)
}

async function getPickedBy(req: Request) {
  const { addresses } = req.body
  validateAddresses(addresses)
  return await SnapshotSubgraph.get().getPickedBy(addresses, SNAPSHOT_SPACE)
}
