import { useEffect } from 'react'

import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import { scrollToAnchor } from '../../../helpers/browser'
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

export const BIDDING_AND_TENDERING_ANCHOR = 'bidding-and-tendering'
const PIXELS_OVER_ANCHOR = 40

export default function BiddingAndTendering({ proposal }: Props) {
  const { id, type } = proposal
  const { tenderProposals, isLoadingTenderProposals } = useTenderProposals(id, type)
  const { bidProposals, isLoadingBidProposals } = useBidProposals(id, type)
  const showTenderProposals =
    proposal.type === ProposalType.Pitch && tenderProposals?.data && tenderProposals?.total > 0
  const showBidProposals = proposal.type === ProposalType.Tender && bidProposals?.data && bidProposals?.total > 0

  useEffect(() => {
    if (!isLoadingTenderProposals && !isLoadingBidProposals && typeof window !== 'undefined') {
      const hash = window.location.hash
      const anchorHash = `#${BIDDING_AND_TENDERING_ANCHOR}`
      if (hash === anchorHash) {
        setTimeout(() => {
          scrollToAnchor(BIDDING_AND_TENDERING_ANCHOR, PIXELS_OVER_ANCHOR)
        }, 300)
      }
    }
  }, [showTenderProposals, showBidProposals])

  return (
    <div id={BIDDING_AND_TENDERING_ANCHOR}>
      {showTenderProposals && <TenderProposals proposals={tenderProposals.data} />}
      {showBidProposals && <BidProposals proposals={bidProposals.data} />}
      {proposal.type === ProposalType.Pitch && <AboutPitchProcess proposal={proposal} />}
      {proposal.type === ProposalType.Tender && <AboutTenderProcess proposal={proposal} />}
      {proposal.type === ProposalType.Bid && <AboutBidProcess proposal={proposal} />}
    </div>
  )
}
