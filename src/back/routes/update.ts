import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { Request } from 'express'
import isNaN from 'lodash/isNaN'
import toNumber from 'lodash/toNumber'

import {
  FinancialRecord,
  FinancialUpdateSectionSchema,
  GeneralUpdateSectionSchema,
  UpdateGeneralSection,
} from '../../entities/Updates/types'
import {
  getCurrentUpdate,
  getFundsReleasedSinceLatestUpdate,
  getLatestUpdate,
  getNextPendingUpdate,
  getPendingUpdates,
  getPublicUpdates,
  getReleases,
} from '../../entities/Updates/utils'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { FinancialService } from '../../services/FinancialService'
import { ProjectService } from '../../services/ProjectService'
import { VestingService } from '../../services/VestingService'
import { ErrorCategory } from '../../utils/errorCategories'
import type { Project } from '../models/Project'
import { UpdateService } from '../services/update'
import { validateCanEditProject } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/updates', handleAPI(getProjectUpdates))
  route.post('/updates', withAuth, handleAPI(createProjectUpdate))
  route.get('/updates/financials', handleAPI(getAllFinancialRecords))
  route.get('/updates/:update_id', handleAPI(getProjectUpdate))
  route.patch('/updates/:update_id', withAuth, handleAPI(updateProjectUpdate))
  route.delete('/updates/:update_id', withAuth, handleAPI(deleteProjectUpdate))
  route.get('/updates/:update_id/comments', handleAPI(getProjectUpdateComments))
})

async function getAllFinancialRecords(req: Request<{ page_number: string; page_size: string }>) {
  const pageNumberParam = toNumber(req.query.page_number)
  const pageSizeParam = toNumber(req.query.page_size)
  const pageNumber = !isNaN(pageNumberParam) ? pageNumberParam : 0
  const pageSize = !isNaN(pageSizeParam) ? pageSizeParam : 10
  if (pageNumber < 0 || pageSize < 0) {
    throw new RequestError('Invalid page_number or page_size', RequestError.BadRequest)
  }
  if (pageSize > 100) {
    throw new RequestError('page_size must be less or equal than 100', RequestError.BadRequest)
  }

  return await FinancialService.getAll(pageNumber, pageSize)
}

async function getProjectUpdate(req: Request<{ update_id: string }>) {
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

async function getProjectUpdateComments(req: Request<{ update_id: string }>) {
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
async function updateProjectUpdate(req: WithAuth<Request<{ update_id: string }>>) {
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

  const user = req.auth!

  const project = await ProjectService.getUpdatedProject(update.project_id)
  await validateCanEditProject(user, project.id)

  return await UpdateService.updateProjectUpdate(
    update,
    project,
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
    user!
  )
}

async function deleteProjectUpdate(req: WithAuth<Request<{ update_id: string }>>) {
  const id = req.params.update_id
  if (!id || typeof id !== 'string') {
    throw new RequestError(`Missing or invalid id`, RequestError.BadRequest)
  }

  const update = await UpdateService.getById(id)

  if (!update) {
    throw new RequestError(`Update not found: "${id}"`, RequestError.NotFound)
  }

  const user = req.auth!
  validateCanEditProject(user, update.project_id)

  if (!update.completion_date) {
    throw new RequestError(`Update is not completed: "${update.id}"`, RequestError.BadRequest)
  }

  await FinancialService.deleteRecordsByUpdateId(update.id)
  await UpdateService.delete(update)
  UpdateService.commentUpdateDeleteInDiscourse(update)

  return true
}

function parseFinancialRecords(financial_records: unknown) {
  const parsedResult = FinancialUpdateSectionSchema.safeParse({ financial_records })
  if (!parsedResult.success) {
    ErrorService.report('Submission of invalid financial records', {
      error: parsedResult.error,
      category: ErrorCategory.Financial,
    })
    throw new RequestError(`Invalid financial records`, RequestError.BadRequest)
  }
  return parsedResult.data.financial_records
}

async function validateFinancialRecords(
  project: Project,
  financial_records: unknown
): Promise<FinancialRecord[] | null> {
  const { id, vesting_addresses } = project
  const [vestingData, updates] = await Promise.all([
    VestingService.getVestingInfo(vesting_addresses),
    UpdateService.getAllByProjectId(id),
  ])

  const releases = vestingData ? getReleases(vestingData) : undefined
  const publicUpdates = getPublicUpdates(updates)
  const latestUpdate = getLatestUpdate(publicUpdates || [])
  const { releasedFunds } = getFundsReleasedSinceLatestUpdate(latestUpdate, releases)
  return releasedFunds > 0 ? parseFinancialRecords(financial_records) : null
}

async function createProjectUpdate(req: WithAuth) {
  const user = req.auth!
  const { project_id, author, financial_records, ...body } = req.body
  const { health, introduction, highlights, blockers, next_steps, additional_notes } = validate<UpdateGeneralSection>(
    schema.compile(GeneralUpdateSectionSchema),
    body
  )
  try {
    const project = await ProjectService.getUpdatedProject(project_id)
    await validateCanEditProject(user, project.id)

    const financialRecords = await validateFinancialRecords(project, financial_records)
    return await UpdateService.create(
      {
        author,
        health,
        introduction,
        highlights,
        blockers,
        next_steps,
        additional_notes,
        financial_records: financialRecords,
      },
      project,
      user
    )
  } catch (error) {
    ErrorService.report('Error creating update', {
      error,
      category: ErrorCategory.Update,
    })
    throw new RequestError(`Something went wrong: ${error}`, RequestError.InternalServerError)
  }
}

async function getProjectUpdates(req: Request) {
  const project_id = req.query.project_id as string
  if (!project_id) {
    throw new RequestError(`Project not found: "${project_id}"`, RequestError.NotFound)
  }

  const updates = await UpdateService.getAllByProjectId(project_id)
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
