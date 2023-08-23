import { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { ProjectService } from '../../services/ProjectService'

export default routes((route) => {
  route.get('/projects', handleJSON(getProjects))
  route.get('/projects/pitchs-total', handleJSON(getOpenPitchsTotal))
  route.get('/projects/tenders-count', handleJSON(getOpenTendersTotal))
})

async function getProjects() {
  return await ProjectService.getProjects()
}

async function getOpenPitchsTotal() {
  return await ProjectService.getOpenPitchsTotal()
}

async function getOpenTendersTotal() {
  return await ProjectService.getOpenTendersTotal()
}
