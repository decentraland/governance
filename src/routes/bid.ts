import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import BidService from '../services/BidService'

export default routes((route) => {
  route.get('/bids/:tenderId/get-user-bid', auth({ optional: true }), handleAPI(getUserBid))
  route.get('/bids/:tenderId', handleAPI(getBidsInfoByTender))
})

async function getUserBid(req: WithAuth) {
  const user = req.auth!
  const { tenderId } = req.params
  return await BidService.getUserBidOnTender(user, tenderId)
}

async function getBidsInfoByTender(req: Request) {
  const { tenderId } = req.params
  return await BidService.getBidsInfoByTender(tenderId)
}
