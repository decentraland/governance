import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { Request } from 'express'

import CoauthorModel from './model'
import {
  CoauthorAttributes,
  UpdateStatus,
  isCoauthorStatusType,
  toCoauthorStatusType,
  updateStatusScheme,
} from './types'

export default routes((route) => {
  const withAuth = auth()
  route.get('/coauthors/proposals/:address/:status?', handleAPI(getProposals))
  route.get('/coauthors/:proposal/:status?', handleAPI(getCoauthors))
  route.put('/coauthors/:proposal', withAuth, handleAPI(updateStatus))
})

function validateStatus(status: string | undefined) {
  if (status && !isCoauthorStatusType(status.toUpperCase())) {
    throw new Error('Invalid status')
  }

  return toCoauthorStatusType(status?.toUpperCase())
}

export async function getProposals(req: Request) {
  const address = req.params.address
  const status = validateStatus(req.params.status)
  return await CoauthorModel.findProposals(address, status)
}

export async function getCoauthors(req: Request) {
  const id = req.params.proposal
  const status = validateStatus(req.params.status)
  return await CoauthorModel.findCoauthors(id, status)
}

const updateStatusValidator = schema.compile(updateStatusScheme)

export async function updateStatus(req: WithAuth<Request>): Promise<CoauthorAttributes | null> {
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

  return null
}
