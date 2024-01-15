import { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import CacheService, { TTL_1_HS } from '../../services/CacheService'
import { ProjectService } from '../../services/ProjectService'

export default routes((route) => {
  route.get('/projects', handleJSON(getProjects))
  route.get('/projects/pitches-total', handleJSON(getOpenPitchesTotal))
  route.get('/projects/tenders-total', handleJSON(getOpenTendersTotal))
})

async function getProjects() {
  const cacheKey = 'projects'
  const cachedProjects = CacheService.get<Awaited<ReturnType<typeof ProjectService.getProjects>>>(cacheKey)
  if (cachedProjects) {
    return cachedProjects
  }
  const projects = await ProjectService.getProjects()
  CacheService.set(cacheKey, projects, TTL_1_HS)
  return projects
}

async function getOpenPitchesTotal() {
  return await ProjectService.getOpenPitchesTotal()
}

async function getOpenTendersTotal() {
  return await ProjectService.getOpenTendersTotal()
}
