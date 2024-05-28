import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI, { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import CacheService, { TTL_1_HS } from '../../services/CacheService'
import { ProjectService } from '../../services/ProjectService'
import { isProjectAuthorOrCoauthor } from '../../utils/projects'
import PersonnelModel, { PersonnelAttributes, PersonnelInCreationSchema } from '../models/Personnel'
import { isValidDate, validateId } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/projects', handleJSON(getProjects))
  route.post('/projects/personnel/', withAuth, handleAPI(addPersonnel))
  route.delete('/projects/personnel/:personnel_id', withAuth, handleAPI(deletePersonnel))
  route.get('/projects/:project', handleAPI(getProject))
  route.get('/projects/pitches-total', handleJSON(getOpenPitchesTotal))
  route.get('/projects/tenders-total', handleJSON(getOpenTendersTotal))
})

type ProjectsReturnType = Awaited<ReturnType<typeof ProjectService.getProjects>>

function filterProjectsByDate(projects: ProjectsReturnType, from?: Date, to?: Date): ProjectsReturnType {
  return {
    data: projects.data.filter((project) => {
      const createdAt = new Date(project.created_at)
      return (!from || createdAt >= from) && (!to || createdAt < to)
    }),
  }
}

async function getProjects(req: Request) {
  const from = isValidDate(req.query.from as string) ? new Date(req.query.from as string) : undefined
  const to = isValidDate(req.query.to as string) ? new Date(req.query.to as string) : undefined

  if (from && to && from > to) {
    throw new RequestError('Invalid date range', RequestError.BadRequest)
  }

  const cacheKey = `projects`
  const cachedProjects = CacheService.get<ProjectsReturnType>(cacheKey)
  if (cachedProjects) {
    return filterProjectsByDate(cachedProjects, from, to)
  }
  const projects = await ProjectService.getProjects()
  CacheService.set(cacheKey, projects, TTL_1_HS)
  return filterProjectsByDate(projects, from, to)
}

async function getProject(req: Request<{ project: string }>) {
  const id = validateId(req.params.project)
  try {
    return await ProjectService.getProject(id)
  } catch (e) {
    console.log(`Error getting project: ${e}`) //TODO: remove before merging projects to main
    throw new RequestError(`Project "${id}" not found`, RequestError.NotFound)
  }
}

async function getOpenPitchesTotal() {
  return await ProjectService.getOpenPitchesTotal()
}

async function getOpenTendersTotal() {
  return await ProjectService.getOpenTendersTotal()
}

async function addPersonnel(req: WithAuth): Promise<PersonnelAttributes> {
  const user = req.auth!
  const { personnel } = req.body
  validateId(personnel.project_id)
  const project = await ProjectService.getProject(personnel.project_id)
  if (!project) {
    throw new RequestError(`Project "${personnel.project_id}" not found`, RequestError.NotFound)
  }
  if (!isProjectAuthorOrCoauthor(user, project)) {
    throw new RequestError("Only the project's authors and coauthors can create personnel", RequestError.Unauthorized)
  }
  const parsedPersonnel = PersonnelInCreationSchema.safeParse(personnel)
  if (!parsedPersonnel.success) {
    throw new RequestError(`Invalid personnel: ${parsedPersonnel.error.message}`, RequestError.BadRequest)
  }
  return await ProjectService.addPersonnel(parsedPersonnel.data, user)
}

async function deletePersonnel(req: WithAuth<Request<{ personnel_id: string }>>): Promise<string | null> {
  const user = req.auth!
  const personnel_id = req.params.personnel_id
  validateId(personnel_id)
  const personnel = await PersonnelModel.findOne<PersonnelAttributes>(personnel_id)
  if (!personnel) {
    throw new RequestError(`Personnel "${personnel_id}" not found`, RequestError.NotFound)
  }
  const project = await ProjectService.getProject(personnel.project_id)
  if (!project) {
    throw new RequestError(`Project "${personnel.project_id}" not found`, RequestError.NotFound)
  }
  if (!isProjectAuthorOrCoauthor(user, project)) {
    throw new RequestError("Only the project's authors and coauthors can delete personnel", RequestError.Unauthorized)
  }
  return await ProjectService.deletePersonnel(personnel_id, user)
}
