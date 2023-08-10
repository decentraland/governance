import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { v1 as uuid } from 'uuid'

import { LEGISLATOR_BADGE_SPEC_CID } from '../../constants'
import { ProposalAttributes, ProposalType } from '../../entities/Proposal/types'
import { ErrorService } from '../../services/ErrorService'
import { ErrorCategory } from '../../utils/errorCategories'
import AirdropJob from '../models/AirdropJob'

export async function giveLegislatorBadges(acceptedProposals: ProposalAttributes[]) {
  const authorsAndCoauthors = acceptedProposals.flatMap((acceptedProposal) => {
    if (acceptedProposal.type === ProposalType.Governance) {
      return [acceptedProposal.user, ...acceptedProposal.configuration.coAuthors]
    }
    return []
  })
  await queueAirdropJob(LEGISLATOR_BADGE_SPEC_CID, authorsAndCoauthors)
}

export async function queueAirdropJob(badgeSpec: string, recipients: string[]) {
  logger.log(`Enqueueing airdrop job`, { badgeSpec, recipients })
  try {
    await AirdropJob.create({ id: uuid(), badge_spec: badgeSpec, recipients })
  } catch (error) {
    ErrorService.report('Unable to create AirdropJob', { error, category: ErrorCategory.Badges, badgeSpec, recipients })
  }
}
