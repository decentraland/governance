import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SnapshotVote } from '../../clients/SnapshotTypes'
import { SnapshotService } from '../../services/SnapshotService'
import { SnapshotStatusService } from '../../services/SnapshotStatusService'
import {
  validateAddress,
  validateDates,
  validateProposalFields,
  validateProposalSnapshotId,
} from '../utils/validations'

export default routes((router) => {
  router.get('/snapshot/status', handleAPI(getStatus))
  router.get('/snapshot/config/:spaceName', handleAPI(getConfig))
  router.post('/snapshot/votes', handleAPI(getVotesByAddresses))
  router.get('/snapshot/votes/:proposalSnapshotId', handleAPI(getVotesByProposal))
  router.post('/snapshot/votes/all', handleAPI(getVotesByDates))
  router.post('/snapshot/proposals', handleAPI(getProposals))
  router.post('/snapshot/proposals/pending', handleAPI(getPendingProposals))
  router.get('/snapshot/vp-distribution/:address/:proposalSnapshotId?', handleAPI(getVpDistribution))
  router.post('/snapshot/scores', handleAPI(getScores))
  router.get('/snapshot/proposal-scores/:proposalSnapshotId', handleAPI(getProposalScores))
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

async function getVotesByDates(req: Request): Promise<SnapshotVote[]> {
  const { start, end } = req.body
  const { validatedStart, validatedEnd } = validateDates(start, end)

  return await SnapshotService.getVotesByDates(validatedStart, validatedEnd)
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
