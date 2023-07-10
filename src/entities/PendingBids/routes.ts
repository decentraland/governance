import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'

import Time from '../../utils/date/Time'

// import { Request } from 'express'
import PendingBidsModel from './model'
import { NewPendingBid, newPendingBidScheme } from './types'

export default routes((route) => {
  const withAuth = auth()
  route.post('/bid', withAuth, handleAPI(postNewBid))
})
const newPendingBidValidator = schema.compile(newPendingBidScheme)
async function postNewBid(req: WithAuth) {
  const author_address = req.auth!
  const configuration = validate<Omit<NewPendingBid, 'author_address' | 'publish_at'>>(
    newPendingBidValidator,
    req.body || {}
  )
  // TODO: check if the tender is still open for bids
  const tenderBids = await PendingBidsModel.getBidsInfoByTender(configuration.tender_id)

  const publish_at = tenderBids.length > 0 ? tenderBids[0].publish_at : Time(new Date()).add(30, 'day').toISOString()
  await PendingBidsModel.createPendingBid({
    ...configuration,
    author_address,
    publish_at,
  })
}
