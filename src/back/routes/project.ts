import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import CoauthorModel from '../../entities/Coauthor/model'
import { CoauthorStatus } from '../../entities/Coauthor/types'
import { CategorizedGrants, GrantWithUpdate } from '../../entities/Proposal/types'
import { ProjectService } from '../../services/ProjectService'
import { validateAddress } from '../utils/validations'

export default routes((route) => {
  route.get('/proposals/grants', handleAPI(getGrants))
  route.get('/proposals/grants/:address', handleAPI(getGrantsByUser))
})

async function getGrants(): Promise<CategorizedGrants> {
  return await ProjectService.getGrants()
}

async function getGrantsByUser(req: Request): ReturnType<typeof getGrants> {
  const address = req.params.address
  const isCoauthoring = req.query.coauthor === 'true'
  validateAddress(address)

  let coauthoringProposalIds = new Set<string>()

  if (isCoauthoring) {
    const coauthoring = await CoauthorModel.findProposals(address, CoauthorStatus.APPROVED)
    coauthoringProposalIds = new Set(coauthoring.map((coauthoringAttributes) => coauthoringAttributes.proposal_id))
  }

  const grantsResult = await getGrants()

  const filterGrants = (grants: GrantWithUpdate[]) => {
    return grants.filter(
      (grant) => grant.user.toLowerCase() === address.toLowerCase() || coauthoringProposalIds.has(grant.id)
    )
  }

  const current = filterGrants(grantsResult.current)
  const past = filterGrants(grantsResult.past)

  return {
    current,
    past,
    total: current.length + past.length,
  }
}
