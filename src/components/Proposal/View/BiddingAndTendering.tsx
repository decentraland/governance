import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import { useBidProposals } from '../../../hooks/useBidProposals'
import { useTenderProposals } from '../../../hooks/useTenderProposals'

import AboutBidProcess from './AboutBidProcess'
import AboutPitchProcess from './AboutPitchProcess'
import AboutTenderProcess from './AboutTenderProcess'
import BidProposals from './BidProposals'
import TenderProposals from './TenderProposals'

interface Props {
  proposal: ProposalAttributes
}

export default function BiddingAndTendering({ proposal }: Props) {
  const { id, type } = proposal
  const { tenderProposals } = useTenderProposals(id, type)
  const { bidProposals } = useBidProposals(id, type)

  const showTenderProposals =
    proposal.type === ProposalType.Pitch && tenderProposals?.data && tenderProposals?.total > 0
  const showBidProposals = proposal.type === ProposalType.Tender && bidProposals?.data && bidProposals?.total > 0

  return (
    <>
      {showTenderProposals && <TenderProposals proposals={tenderProposals.data} />}
      {showBidProposals && <BidProposals proposals={bidProposals.data} />}
      {proposal.type === ProposalType.Pitch && <AboutPitchProcess proposal={proposal} />}
      {proposal.type === ProposalType.Tender && <AboutTenderProcess proposal={proposal} />}
      {proposal.type === ProposalType.Bid && <AboutBidProcess proposal={proposal} />}
    </>
  )
}
