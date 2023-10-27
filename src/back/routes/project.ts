import { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { ProjectService } from '../../services/ProjectService'

export default routes((route) => {
  route.get('/projects', handleJSON(getProjects))
  route.get('/projects/pitches-total', handleJSON(getOpenPitchesTotal))
  route.get('/projects/tenders-total', handleJSON(getOpenTendersTotal))
  route.get('/projects/priority', handleJSON(getPriorityProjects))
})

async function getProjects() {
  return await ProjectService.getProjects()
}

async function getOpenPitchesTotal() {
  return await ProjectService.getOpenPitchesTotal()
}

async function getOpenTendersTotal() {
  return await ProjectService.getOpenTendersTotal()
}

async function getPriorityProjects() {
  return await ProjectService.getPriorityProjects()
}
