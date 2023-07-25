import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { validateAddress } from '../../back/routes/validations'
import { BadgesService } from '../../services/BadgesService'

import { UserBadges } from './types'

export default routes((router) => {
  router.get('/badges/:address/', handleAPI(getBadges))
})

async function getBadges(req: Request<{ address: string }>): Promise<UserBadges> {
  const address = req.params.address
  validateAddress(address)
  return await BadgesService.getBadges(address)
}
