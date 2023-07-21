import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import BidService from '../../services/BidService'

export default routes((route) => {
  const withAuth = auth()
  route.get('/bids/:tenderId/get-user-bid', withAuth, handleAPI(getUserBid))
  route.get('/bids/:tenderId/is-submission-finished', handleAPI(isSubmissionFinished))
})
async function getUserBid(req: WithAuth) {
  const user = req.auth!
  const { tenderId } = req.params
  return await BidService.getUserBidOnTender(user, tenderId)
}
async function isSubmissionFinished(req: Request) {
  const { tenderId } = req.params
  return await BidService.isSubmissionWindowFinished(tenderId)
}
