import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'

import CompetingBids from './CompetingBids'
import CompetingTenders from './CompetingTenders'

interface Props {
  proposal: ProposalAttributes
}

export default function CompetingBiddingAndTendering({ proposal }: Props) {
  const isActiveProposal = !!proposal && proposal.status === ProposalStatus.Active
  const showCompetingTenders = isActiveProposal && proposal.type === ProposalType.Tender
  const showCompetingBids = isActiveProposal && proposal.type === ProposalType.Bid

  return (
    <>
      {showCompetingTenders && <CompetingTenders proposal={proposal} />}
      {showCompetingBids && <CompetingBids proposal={proposal} />}
    </>
  )
}
