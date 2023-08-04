import { v1 as uuid } from 'uuid'

import { ProposalAttributes, ProposalType } from '../../entities/Proposal/types'
import { ErrorService } from '../../services/ErrorService'
import { ErrorCategory } from '../../utils/errorCategories'
import AirdropJob from '../models/AirdropJob'

const LEGISLATOR_BADGE_SPEC_CID = process.env.LEGISLATOR_BADGE_SPEC_CID || ''

export async function giveLegislatorBadges(acceptedProposals: ProposalAttributes[]) {
  const authorsAndCoauthors = acceptedProposals.flatMap((acceptedProposal) => {
    if (acceptedProposal.type === ProposalType.Governance) {
      const {
        user,
        configuration: { coauthors },
      } = acceptedProposal
      return [user, ...coauthors]
    }
    return []
  })
  await queueAirdropJob(LEGISLATOR_BADGE_SPEC_CID, authorsAndCoauthors)
}

async function queueAirdropJob(badgeSpec: string, recipients: string[]) {
  try {
    await AirdropJob.create({ id: uuid(), badge_spec: badgeSpec, recipients })
  } catch (error) {
    ErrorService.report('Unable to create AirdropJob', { error, category: ErrorCategory.Badges, badgeSpec, recipients })
  }
}
