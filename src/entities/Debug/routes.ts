import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { DEBUG_ADDRESSES } from './isDebugAddress'

export default routes((router) => {
  return router.get(
    '/debug',
    handleAPI(async () => DEBUG_ADDRESSES)
  )
})
