import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import CacheService, { TTL_1_HS } from '../../services/CacheService'
import { ProjectService } from '../../services/ProjectService'
import { isValidDate } from '../utils/validations'

export default routes((route) => {
  route.get('/projects', handleJSON(getProjects))
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

async function getOpenPitchesTotal() {
  return await ProjectService.getOpenPitchesTotal()
}

async function getOpenTendersTotal() {
  return await ProjectService.getOpenTendersTotal()
}
