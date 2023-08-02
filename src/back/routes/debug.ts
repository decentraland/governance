import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { DEBUG_ADDRESSES } from '../../entities/Debug/isDebugAddress'
import { ErrorService } from '../../services/ErrorService'

export default routes((router) => {
  const withAuth = auth()
  router.get(
    '/debug',
    handleAPI(async () => DEBUG_ADDRESSES)
  )
  router.post('/debug/report-error', withAuth, handleAPI(reportClientError))
})

function reportClientError(req: WithAuth): void {
  ErrorService.report(req.body.message, { frontend: true, ...req.body.extraInfo })
}
