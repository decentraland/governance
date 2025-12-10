import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { DAO_COUNCIL_ADDRESSES } from '../constants'

export default routes((router) => {
  return router.get(
    '/dao-council',
    handleAPI(async () => DAO_COUNCIL_ADDRESSES)
  )
})
