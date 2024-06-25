import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import AirdropJobModel from '../models/AirdropJob'
import { validateDebugAddress } from '../utils/validations'

export default routes((router) => {
  const withAuth = auth()
  router.get('/airdrops/all', withAuth, handleAPI(getAllAirdropJobs))
})

async function getAllAirdropJobs(req: WithAuth) {
  const user = req.auth!
  validateDebugAddress(user)

  return AirdropJobModel.getAll()
}
