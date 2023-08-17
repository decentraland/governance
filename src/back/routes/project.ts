import { handleJSON } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { ProjectService } from '../../services/ProjectService'

export default routes((route) => {
  route.get('/projects', handleJSON(getProjects))
})

async function getProjects() {
  return await ProjectService.getProjects()
}
