import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { validateAddress } from '../utils/validations'

// Governance badges are retired. These two public reads stay only so a frontend built before the
// retirement keeps rendering "no badges" instead of erroring, whichever of the two deploys goes
// first. Remove this file once no deployed governance-ui calls them.

type RetiredUserBadges = { currentBadges: never[]; expiredBadges: never[]; total: 0 }

export default routes((router) => {
  router.get('/badges/core-units/', handleAPI(getCoreUnitsBadgeSpecs))
  router.get('/badges/:address/', handleAPI(getBadges))
})

function getBadges(req: Request<{ address: string }>): RetiredUserBadges {
  validateAddress(req.params.address)
  return { currentBadges: [], expiredBadges: [], total: 0 }
}

function getCoreUnitsBadgeSpecs(): never[] {
  return []
}
