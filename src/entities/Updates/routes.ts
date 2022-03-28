import { Request } from 'express'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import { auth, WithAuth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import UpdateModel from './model'
import { UpdateAttributes, UpdateStatus } from './types'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { getNextUpdate, getPublicUpdates } from './utils'

export default routes((route) => {
  const withAuth = auth()
  route.get('/proposals/:proposal/updates', handleAPI(getProposalUpdates))
  route.get('/proposals/:update/update', handleAPI(getProposalUpdate))
  route.patch('/proposals/:proposal/updates', withAuth, handleAPI(updateProposalUpdate))
})

async function getProposalUpdate(req: Request<{ update: string }>) {
  const id = req.params.update

  if (!id) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
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

  return {
    publicUpdates,
    nextUpdate,
  }
}

async function updateProposalUpdate(req: WithAuth<Request<{ proposal: string }>>) {
  const { id, health, introduction, highlights, blockers, next_steps, additional_notes } = req.body
  const update = await UpdateModel.findOne(id)

  if (!!update.completion_date) {
    throw new RequestError(`Update already completed: "${update.id}"`, RequestError.BadRequest)
  }

  // TODO: Get proposal and check if user is same as proposal creator.

  const now = new Date()
  const status = !update.due_date || Time(now).isBefore(update.due_date) ? UpdateStatus.Done : UpdateStatus.Late

  await UpdateModel.update<UpdateAttributes>(
    { health, introduction, highlights, blockers, next_steps, additional_notes, status, completion_date: now },
    { id }
  )

  return true
}
