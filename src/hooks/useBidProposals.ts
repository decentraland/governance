import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'

import useProposals from './useProposals'

export function useBidProposals(
  linkedProposalId?: ProposalAttributes['id'],
  proposalType?: ProposalAttributes['type']
) {
  const { proposals, isLoadingProposals } = useProposals({
    linkedProposalId,
    type: ProposalType.Bid,
    load: !!linkedProposalId && proposalType === ProposalType.Tender,
  })

  return {
    bidProposals: proposals,
    isLoadingBidProposals: isLoadingProposals,
  }
}
