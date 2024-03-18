import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { Request } from 'express'

import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import {
  FinancialUpdateSectionSchema,
  GeneralUpdateSectionSchema,
  UpdateGeneralSection,
} from '../../entities/Updates/types'
import { isBetweenLateThresholdDate } from '../../entities/Updates/utils'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { FinancialService } from '../../services/FinancialService'
import Time from '../../utils/date/Time'
import { ErrorCategory } from '../../utils/errorCategories'
import { CoauthorService } from '../services/coauthor'
import { UpdateService } from '../services/update'

export default routes((route) => {
  const withAuth = auth()
  route.get('/updates/financials', handleAPI(getAllFinancialRecords))
  route.get('/updates/:update_id', handleAPI(getProposalUpdate))
  route.patch('/updates/:update_id', withAuth, handleAPI(updateProposalUpdate))
  route.delete('/updates/:update_id', withAuth, handleAPI(deleteProposalUpdate))
  route.get('/updates/:update_id/comments', handleAPI(getProposalUpdateComments))
})

async function getAllFinancialRecords(req: Request<{ page_number: string; page_size: string }>) {
  const page_number = Number(req.query.page_number) || 0
  const page_size = Number(req.query.page_size) || 10
  if (page_number < 0 || page_size < 0) {
    throw new RequestError('Invalid page_number or page_size', RequestError.BadRequest)
  }
  if (page_size > 100) {
    throw new RequestError('page_size must be less or equal than 100', RequestError.BadRequest)
  }

  return await FinancialService.getAll(page_number, page_size)
}

async function getProposalUpdate(req: Request<{ update_id: string }>) {
  const id = req.params.update_id

  if (!id) {
    throw new RequestError(`Missing id`, RequestError.NotFound)
  }

  const update = await UpdateService.getById(id)

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  return update
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
    ErrorService.report('Error fetching discourse topic', {
      error,
      discourse_topic_id,
      updateId: id,
      category: ErrorCategory.Discourse,
    })
    return {
      comments: [],
      totalComments: 0,
    }
  }
}

const generalSectionValidator = schema.compile(GeneralUpdateSectionSchema)
async function updateProposalUpdate(req: WithAuth<Request<{ update_id: string }>>) {
  const id = req.params.update_id
  const { author, financial_records, ...body } = req.body
  const { health, introduction, highlights, blockers, next_steps, additional_notes } = validate<UpdateGeneralSection>(
    generalSectionValidator,
    body
  )
  const parsedResult = FinancialUpdateSectionSchema.safeParse({ financial_records })
  if (!parsedResult.success) {
    throw new RequestError(`Invalid financial records`, RequestError.BadRequest, parsedResult.error)
  }
  const parsedRecords = parsedResult.data.financial_records
  const update = await UpdateService.getById(id)

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  const user = req.auth

  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: update.proposal_id })
  const isAuthorOrCoauthor =
    user && (proposal?.user === user || (await CoauthorService.isCoauthor(update.proposal_id, user))) && author === user

  if (!proposal || !isAuthorOrCoauthor) {
    throw new RequestError(`Unauthorized`, RequestError.Forbidden)
  }

  const now = new Date()
  const isOnTime = Time(now).isBefore(update.due_date)

  if (!isOnTime && !isBetweenLateThresholdDate(update.due_date)) {
    throw new RequestError(`Update is not on time: "${update.id}"`, RequestError.BadRequest)
  }

  return await UpdateService.updateProposalUpdate(
    update,
    {
      author,
      health,
      introduction,
      highlights,
      blockers,
      next_steps,
      additional_notes,
      financial_records: parsedRecords,
    },
    id,
    proposal,
    user!,
    now,
    isOnTime
  )
}

async function deleteProposalUpdate(req: WithAuth<Request<{ update_id: string }>>) {
  const id = req.params.update_id
  if (!id || typeof id !== 'string') {
    throw new RequestError(`Missing or invalid id`, RequestError.BadRequest)
  }

  const update = await UpdateService.getById(id)

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  if (!update.completion_date) {
    throw new RequestError(`Update is not completed: "${update.id}"`, RequestError.BadRequest)
  }

  const user = req.auth
  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: update.proposal_id })

  const isAuthorOrCoauthor =
    user && (proposal?.user === user || (await CoauthorService.isCoauthor(update.proposal_id, user)))

  if (!proposal || !isAuthorOrCoauthor) {
    throw new RequestError(`Unauthorized`, RequestError.Forbidden)
  }

  await FinancialService.deleteRecordsByUpdateId(update.id)
  await UpdateService.delete(update)
  UpdateService.commentUpdateDeleteInDiscourse(update)

  return true
}
