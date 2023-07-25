import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { UserBadges } from '../../entities/Badges/types'
import { BadgesService } from '../../services/BadgesService'
import { validateAddress } from '../utils/validations'

export default routes((router) => {
  router.get('/badges/:address/', handleAPI(getBadges))
})

async function getBadges(req: Request<{ address: string }>): Promise<UserBadges> {
  const address = req.params.address
  validateAddress(address)
  return await BadgesService.getBadges(address)
}
