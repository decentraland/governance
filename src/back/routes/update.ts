import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import UpdateModel from '../../entities/Updates/model'
import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import {
  getCurrentUpdate,
  getNextPendingUpdate,
  getPendingUpdates,
  getPublicUpdates,
  isBetweenLateThresholdDate,
} from '../../entities/Updates/utils'
import { DiscourseService } from '../../services/DiscourseService'
import Time from '../../utils/date/Time'
import { ErrorCategory } from '../../utils/errorCategories'
import { isProdEnv } from '../../utils/governanceEnvs'
import { CoauthorService } from '../services/coauthor'
import { DiscordService } from '../services/discord'
import { UpdateService } from '../services/update'

export default routes((route) => {
  const withAuth = auth()
  route.get('/proposals/:proposal/updates', handleAPI(getProposalUpdates))
  route.get('/proposals/:update/update', handleAPI(getProposalUpdate))
  route.get('/proposals/:update_id/update/comments', handleAPI(getProposalUpdateComments))
  route.post('/proposals/:proposal/update', withAuth, handleAPI(createProposalUpdate))
  route.patch('/proposals/:proposal/update', withAuth, handleAPI(updateProposalUpdate))
  route.delete('/proposals/:proposal/update', withAuth, handleAPI(deleteProposalUpdate))
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

  const updates = await UpdateService.getAllByProposalId(proposal_id)
  const publicUpdates = getPublicUpdates(updates)
  const nextUpdate = getNextPendingUpdate(updates)
  const currentUpdate = getCurrentUpdate(updates)
  const pendingUpdates = getPendingUpdates(updates)

  return {
    publicUpdates,
    pendingUpdates,
    nextUpdate,
    currentUpdate,
  }
}

async function getProposalUpdateComments(req: Request<{ update_id: string }>) {
  const update = await UpdateService.getById(req.params.update_id)
  if (!update) {
    throw new RequestError('Update not found', RequestError.NotFound)
  }

  const { id, discourse_topic_id } = update
  if (!discourse_topic_id) {
    throw new RequestError('No Discourse topic for this update', RequestError.NotFound)
  }

  try {
    return await DiscourseService.getPostComments(discourse_topic_id)
  } catch (error) {
    if (isProdEnv()) {
      logger.log('Error fetching discourse topic', {
        error,
        discourseTopicId: discourse_topic_id,
        updateId: id,
        category: ErrorCategory.Discourse,
      })
    }
    return {
      comments: [],
      totalComments: 0,
    }
  }
}

async function createProposalUpdate(req: WithAuth<Request<{ proposal: string }>>) {
  const { author, health, introduction, highlights, blockers, next_steps, additional_notes } = req.body

  const user = req.auth!
  const proposalId = req.params.proposal
  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: proposalId })
  const isAuthorOrCoauthor =
    user && (proposal?.user === user || (await CoauthorService.isCoauthor(proposalId, user))) && author === user

  if (!proposal || !isAuthorOrCoauthor) {
    throw new RequestError(`Unauthorized`, RequestError.Forbidden)
  }

  const updates = await UpdateModel.find<UpdateAttributes>({
    proposal_id: proposalId,
    status: UpdateStatus.Pending,
  })

  const currentUpdate = getCurrentUpdate(updates)
  const nextPendingUpdate = getNextPendingUpdate(updates)

  if (updates.length > 0 && (currentUpdate || nextPendingUpdate)) {
    throw new RequestError(`Updates pending for this proposal`, RequestError.BadRequest)
  }

  const data = {
    proposal_id: proposal.id,
    author,
    health,
    introduction,
    highlights,
    blockers,
    next_steps,
    additional_notes,
  }
  const update = await UpdateModel.createUpdate(data)
  await DiscourseService.createUpdate(update, proposal.title)
  DiscordService.newUpdate(proposal.id, proposal.title, update.id, user)

  return update
}

async function updateProposalUpdate(req: WithAuth<Request<{ proposal: string }>>) {
  const { id, author, health, introduction, highlights, blockers, next_steps, additional_notes } = req.body
  const update = await UpdateModel.findOne<UpdateAttributes>(id)
  const proposalId = req.params.proposal

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  const { completion_date } = update

  const user = req.auth
  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: req.params.proposal })

  const isAuthorOrCoauthor =
    user && (proposal?.user === user || (await CoauthorService.isCoauthor(proposalId, user))) && author === user

  if (!proposal || !isAuthorOrCoauthor) {
    throw new RequestError(`Unauthorized`, RequestError.Forbidden)
  }

  const now = new Date()
  const isOnTime = Time(now).isBefore(update.due_date)

  if (!isOnTime && !isBetweenLateThresholdDate(update.due_date)) {
    throw new RequestError(`Update is not on time: "${update.id}"`, RequestError.BadRequest)
  }

  const status = !update.due_date || isOnTime ? UpdateStatus.Done : UpdateStatus.Late

  await UpdateModel.update<UpdateAttributes>(
    {
      author,
      health,
      introduction,
      highlights,
      blockers,
      next_steps,
      additional_notes,
      status,
      completion_date: completion_date || now,
      updated_at: now,
    },
    { id }
  )

  const updatedUpdate = await UpdateService.getById(id)
  if (updatedUpdate) {
    if (!completion_date) {
      await DiscourseService.createUpdate(updatedUpdate, proposal.title)
      DiscordService.newUpdate(proposal.id, proposal.title, update.id, user)
    } else {
      UpdateService.commentUpdateEditInDiscourse(updatedUpdate)
    }
  }

  return true
}

async function deleteProposalUpdate(req: WithAuth<Request<{ proposal: string }>>) {
  const { id } = req.body
  const update = await UpdateModel.findOne(id)
  const proposalId = req.params.proposal

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  if (!update?.completion_date) {
    throw new RequestError(`Update is not completed: "${update.id}"`, RequestError.BadRequest)
  }

  const user = req.auth
  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: req.params.proposal })

  const isAuthorOrCoauthor = user && (proposal?.user === user || (await CoauthorService.isCoauthor(proposalId, user)))

  if (!proposal || !isAuthorOrCoauthor) {
    throw new RequestError(`Unauthorized`, RequestError.Forbidden)
  }

  if (!update.due_date) {
    await UpdateModel.delete<UpdateAttributes>({ id })
  } else {
    await UpdateModel.update<UpdateAttributes>(
      {
        status: UpdateStatus.Pending,
        author: undefined,
        health: undefined,
        introduction: undefined,
        highlights: undefined,
        blockers: undefined,
        next_steps: undefined,
        additional_notes: undefined,
        completion_date: undefined,
      },
      { id: update.id }
    )
  }

  UpdateService.commentUpdateDeleteInDiscourse(update)

  return true
}
