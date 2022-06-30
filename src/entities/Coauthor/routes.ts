import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { Request } from 'express'

import CoauthorModel from './model'
import { CoauthorAttributes, UpdateStatus, toCoauthorStatusType, updateStatusScheme } from './types'

export default routes((route) => {
  const withAuth = auth()
  route.get('/coauthors/proposals/:address/:status?', handleAPI(getProposals))
  route.get('/coauthors/:proposal/:status?', handleAPI(getCoauthors))
  route.put('/coauthors/:proposal', withAuth, handleAPI(updateStatus))
})

export async function getProposals(req: Request) {
  const address = req.params.address
  const status = toCoauthorStatusType(req.params.status)
  return await CoauthorModel.findProposals(address, status)
}

export async function getCoauthors(req: Request) {
  const id = req.params.proposal
  const status = toCoauthorStatusType(req.params.status)
  return await CoauthorModel.findCoauthors(id, status)
}

const updateStatusValidator = schema.compile(updateStatusScheme)

export async function updateStatus(req: WithAuth<Request>): Promise<CoauthorAttributes> {
  const user = req.auth!
  const id = req.params.proposal
  const data = validate<UpdateStatus>(updateStatusValidator, req.body || {})
  const conditions = { proposal_id: id, address: user.toLowerCase() }

  const result = await CoauthorModel.update<CoauthorAttributes>({ status: data.status }, conditions)

  if (result.rowCount === 1) {
    return {
      ...conditions,
      status: data.status,
    }
  }

  const errorMsg = 'Unable to update coauthor status'

  logger.error(errorMsg, { ...conditions, status: data.status, result })
  throw new Error(errorMsg)
}
