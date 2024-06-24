import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import validate from 'decentraland-gatsby/dist/entities/Route/validate'
import schema from 'decentraland-gatsby/dist/entities/Schema'
import { Request } from 'express'

import CoauthorModel from '../entities/Coauthor/model'
import {
  CoauthorAttributes,
  CoauthorStatus,
  UpdateStatus,
  toCoauthorStatusType,
  updateStatusScheme,
} from '../entities/Coauthor/types'
import { isCoauthoringUpdatable } from '../entities/Coauthor/utils'
import ProposalModel from '../entities/Proposal/model'
import { ProposalAttributes } from '../entities/Proposal/types'
import logger from '../utils/logger'
import { validateAddress } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/coauthors/proposals/:address/:status?', handleAPI(getProposals))
  route.get('/coauthors/:proposal/:status?', handleAPI(getCoauthors))
  route.put('/coauthors/:proposal', withAuth, handleAPI(updateStatus))
})

export async function filterCoauthorRequests(requests: CoauthorAttributes[]) {
  const filteredRequests: CoauthorAttributes[] = []
  for (const request of requests) {
    if (request.status === CoauthorStatus.PENDING) {
      const proposal = await ProposalModel.findOne<ProposalAttributes>({ id: request.proposal_id, deleted: false })
      if (proposal && isCoauthoringUpdatable(proposal.finish_at)) {
        filteredRequests.push(request)
      }
    } else {
      filteredRequests.push(request)
    }
  }

  return filteredRequests
}

export async function getProposals(req: Request) {
  const address = validateAddress(req.params.address)
  const status = toCoauthorStatusType(req.params.status)
  const requests = await CoauthorModel.findProposals(address, status)
  return await filterCoauthorRequests(requests)
}

export async function getCoauthors(req: Request) {
  const id = req.params.proposal
  const status = toCoauthorStatusType(req.params.status)
  const requests = await CoauthorModel.findCoauthors(id, status)
  return await filterCoauthorRequests(requests)
}

const updateStatusValidator = schema.compile(updateStatusScheme)

export async function updateStatus(req: WithAuth): Promise<CoauthorAttributes> {
  const user = req.auth!
  const id = req.params.proposal
  const data = validate<UpdateStatus>(updateStatusValidator, req.body || {})

  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id, deleted: false })
  if (!proposal) {
    throw new RequestError(`Not found proposal: "${id}"`, RequestError.NotFound)
  }

  const conditions = { proposal_id: id, address: user.toLowerCase() }
  const errorData: Record<string, string> = { ...conditions, status: data.status }

  if (isCoauthoringUpdatable(proposal.finish_at)) {
    const result = await CoauthorModel.update<CoauthorAttributes>({ status: data.status }, conditions)

    if (result.rowCount === 1) {
      return {
        ...conditions,
        status: data.status,
      }
    }

    errorData['result'] = result
  } else {
    errorData['result'] = 'Proposal is finished'
  }

  const errorMsg = 'Unable to update coauthor status'

  logger.error(errorMsg, errorData)
  throw new Error(errorMsg)
}
