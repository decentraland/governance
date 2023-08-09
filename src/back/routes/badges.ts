import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { UserBadges } from '../../entities/Badges/types'
import isDebugAddress from '../../entities/Debug/isDebugAddress'
import { BadgesService } from '../../services/BadgesService'
import { AirdropOutcome } from '../models/AirdropJob'
import { validateAddress } from '../utils/validations'

export default routes((router) => {
  const withAuth = auth()
  router.get('/badges/:address/', handleAPI(getBadges))
  router.post('/badges/airdrop/', withAuth, handleAPI(airdropBadges))
})

async function getBadges(req: Request<{ address: string }>): Promise<UserBadges> {
  const address = req.params.address
  validateAddress(address)
  return await BadgesService.getBadges(address)
}

async function airdropBadges(req: WithAuth): Promise<AirdropOutcome> {
  const user = req.auth!
  const recipients: string[] = req.body.recipients
  const badgeSpecCId = req.body.badgeSpecCid

  if (!isDebugAddress(user)) {
    throw new RequestError('Invalid user', RequestError.Unauthorized)
  }

  recipients.map((address) => {
    validateAddress(address)
  })

  return await BadgesService.giveBadgeToUsers(badgeSpecCId, recipients)
}
