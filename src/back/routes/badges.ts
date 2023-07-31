import { WithAuth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import { withAuth } from 'decentraland-gatsby/dist/entities/Auth/routes/withDecentralandAuth'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { UserBadges } from '../../entities/Badges/types'
import isDebugAddress from '../../entities/Debug/isDebugAddress'
import { BadgesService } from '../../services/BadgesService'
import { validateAddress } from '../utils/validations'

export default routes((router) => {
  router.get('/badges/:address/', handleAPI(getBadges))
  router.post('/badges/airdrop/', withAuth, handleAPI(airdropBadges))
})

async function getBadges(req: Request<{ address: string }>): Promise<UserBadges> {
  const address = req.params.address
  validateAddress(address)
  return await BadgesService.getBadges(address)
}

async function airdropBadges(req: WithAuth): Promise<string> {
  console.log('got here')
  const user = req.auth!
  const recipients: string[] = req.body.recipients
  const badgeSpecCId = req.body.badgeSpecCid

  console.log('badgeSpecCId', badgeSpecCId)
  console.log('recipients', recipients)

  if (!user || !isDebugAddress(user)) {
    throw new RequestError('Invalid user', RequestError.Unauthorized)
  }
  recipients.map((address) => {
    if (!address || !isEthereumAddress(address)) {
      throw new RequestError('Invalid address', RequestError.BadRequest)
    }
  })

  console.log('airdropping')
  return await BadgesService.grantBadgeToUsers(badgeSpecCId, recipients)
}
