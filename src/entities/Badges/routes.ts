import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { BadgesService } from '../../services/BadgesService'

import { Badge } from './types'

export default routes((router) => {
  router.get('/badges/:address/', handleAPI(getBadges))
})

async function getBadges(req: Request<{ address: string }>): Promise<Badge[]> {
  const address = req.params.address
  if (!address || address.length === 0) {
    return []
  }
  return await BadgesService.getBadges(address)
}
