import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { ADMIN_ADDRESSES } from './isAdmin'

export default routes((router) => {
  return router.get(
    '/admin',
    handleAPI(async () => ADMIN_ADDRESSES)
  )
})
