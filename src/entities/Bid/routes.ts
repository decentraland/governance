import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import BidService from '../../services/BidService'
import isDebugAddress from '../Debug/isDebugAddress'

export default routes((route) => {
  const withAuth = auth()
  route.get('/bids/:tenderId/get-user-bid', withAuth, handleAPI(getUserBid))
  route.get('/bids/:tenderId', handleAPI(getBidsInfoByTender))
  route.delete('/bids', withAuth, handleAPI(removeAllPendingBids))
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

async function removeAllPendingBids(req: WithAuth) {
  const user = req.auth!
  if (!isDebugAddress(user)) {
    throw new Error('Only debug addresses can remove all pending bids')
  }
  return await BidService.removeAllPendingBids()
}
