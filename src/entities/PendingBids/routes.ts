import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { Request, Response } from 'express'

import PendingBidsModel from './model'
import { NewPendingBid, newPendingBidScheme } from './types'

export default routes((route) => {
  const withAuth = auth()
  route.post('/bid', handleAPI(postNewBid))
})
const newPendingBidValidator = schema.compile(newPendingBidScheme)
async function postNewBid(req: Request, res: Response) {
  const configuration = validate<NewPendingBid>(newPendingBidValidator, req.body || {})
  await PendingBidsModel.createPendingBid(configuration)
  res.status(200)
}
