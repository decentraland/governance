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

async function getProjects(req: Request) {
  const from = isValidDate(req.query.from as string) ? new Date(req.query.from as string) : undefined
  const to = isValidDate(req.query.to as string) ? new Date(req.query.to as string) : undefined
  const cacheKey = `projects-${from?.getTime()}-${to?.getTime()}`
  const cachedProjects = CacheService.get<Awaited<ReturnType<typeof ProjectService.getProjects>>>(cacheKey)
  if (cachedProjects) {
    return cachedProjects
  }
  const projects = await ProjectService.getProjects(from, to)
  CacheService.set(cacheKey, projects, TTL_1_HS)
  return projects
}

async function getOpenPitchesTotal() {
  return await ProjectService.getOpenPitchesTotal()
}

async function getOpenTendersTotal() {
  return await ProjectService.getOpenTendersTotal()
}
