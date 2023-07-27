import { ProposalAttributes, ProposalType } from '../../entities/Proposal/types'
import { BadgesService } from '../../services/BadgesService'

const LEGISLATOR_BADGE_SPEC_CID = process.env.LEGISLATOR_BADGE_SPEC_CID || ''

//TODO: error handling in this mofo
export async function grantLegislatorBadges(acceptedProposals: ProposalAttributes[]) {
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
  await BadgesService.grantBadgeToUsers(LEGISLATOR_BADGE_SPEC_CID, authorsAndCoauthors)
}
