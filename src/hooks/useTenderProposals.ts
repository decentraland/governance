import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'

import useProposals from './useProposals'

export function useTenderProposals(
  linkedProposalId?: ProposalAttributes['id'],
  proposalType?: ProposalAttributes['type']
) {
  const { proposals, isLoadingProposals } = useProposals({
    linkedProposalId,
    load: proposalType === ProposalType.Pitch || proposalType === ProposalType.Tender,
  })

  return {
    tenderProposals: proposals,
    isLoadingTenderProposals: isLoadingProposals,
  }
}
