import { Request } from 'express'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import { auth, WithAuth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { getNextUpdate, getPublicUpdates, getPendingUpdates, getCurrentUpdate, isBetweenLateThresholdDate } from './utils'
import UpdateModel from './model'
import { UpdateAttributes, UpdateStatus } from './types'
import ProposalModel from '../Proposal/model'
import { ProposalAttributes } from '../Proposal/types'

export default routes((route) => {
  const withAuth = auth()
  route.get('/proposals/:proposal/updates', handleAPI(getProposalUpdates))
  route.get('/proposals/:update/update', handleAPI(getProposalUpdate))
  route.post('/proposals/:proposal/update', withAuth, handleAPI(createProposalUpdate))
  route.patch('/proposals/:proposal/update', withAuth, handleAPI(updateProposalUpdate))
})

async function getProposalUpdate(req: Request<{ update: string }>) {
  const id = req.params.update

  if (!id) {
    throw new RequestError(`Missing id`, RequestError.NotFound)
  }

  const update = await UpdateModel.findOne<UpdateAttributes>({ id })

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  return update
}

async function getProposalUpdates(req: Request<{ proposal: string }>) {
  const proposal_id = req.params.proposal

  if (!proposal_id) {
    throw new RequestError(`Proposal not found: "${proposal_id}"`, RequestError.NotFound)
  }

  const updates = await UpdateModel.find<UpdateAttributes>({ proposal_id })
  const publicUpdates = getPublicUpdates(updates)
  const nextUpdate = getNextUpdate(updates)
  const currentUpdate = getCurrentUpdate(updates)
  const pendingUpdates = getPendingUpdates(updates)

  return {
    publicUpdates,
    pendingUpdates,
    nextUpdate,
    currentUpdate,
  }
}

async function createProposalUpdate(req: WithAuth<Request<{ proposal: string }>>) {
  const { health, introduction, highlights, blockers, next_steps, additional_notes } = req.body

  const user = req.auth!
  const proposalId = req.params.proposal
  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: proposalId })

  if (proposal?.user !== user) {
    throw new RequestError(`Unauthorized`, RequestError.Forbidden)
  }

  const updates = await UpdateModel.find({
    proposal_id: proposalId,
    status: UpdateStatus.Pending
  })

  if (updates.length > 0) {
    throw new RequestError(`Updates pending for this proposal`, RequestError.BadRequest)
  }

  return await UpdateModel.createUpdate({
    proposal_id: proposal?.id!,
    health,
    introduction,
    highlights,
    blockers,
    next_steps,
    additional_notes,
  })
}

async function updateProposalUpdate(req: WithAuth<Request<{ proposal: string }>>) {
  const { id, health, introduction, highlights, blockers, next_steps, additional_notes } = req.body
  const update = await UpdateModel.findOne(id)

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  if (!!update?.completion_date) {
    throw new RequestError(`Update already completed: "${update.id}"`, RequestError.BadRequest)
  }

  const user = req.auth
  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: req.params.proposal })

  if (proposal?.user !== user) {
    throw new RequestError(`Unauthorized`, RequestError.Forbidden)
  }

  const now = new Date()
  const isOnTime = Time(now).isBefore(update.due_date)

  if (!isOnTime && !isBetweenLateThresholdDate(update.due_date)) {
    throw new RequestError(`Update is not on time: "${update.id}"`, RequestError.BadRequest)
  }

  const status = !update.due_date || isOnTime ? UpdateStatus.Done : UpdateStatus.Late

  await UpdateModel.update<UpdateAttributes>(
    { health, introduction, highlights, blockers, next_steps, additional_notes, status, completion_date: now },
    { id }
  )

  return true
}
