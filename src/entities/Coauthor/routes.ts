import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import CoauthorModel from './model'

export default routes((route) => {
  const withAuth = auth()
  route.get('/coauthors/proposals/:address', handleAPI(getProposals))
  route.get('/coauthors/:proposal', handleAPI(getCoauthors))
  route.put('/coauthors/:proposal', withAuth, handleAPI(updateStatus))
})

export async function getProposals(req: Request) {
  const address = req.params.address
  return await CoauthorModel.findProposals(address)
}

export async function getCoauthors(req: Request) {
  return null
}

export async function updateStatus(req: WithAuth<Request>) {
  return null
}
