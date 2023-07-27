import { ProposalAttributes, ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { hasTenderProcessStarted } from '../entities/Proposal/utils'

import useProposals from './useProposals'

export function useTenderProposals(
  linkedProposalId?: ProposalAttributes['id'],
  proposalType?: ProposalAttributes['type']
) {
  const { proposals, isLoadingProposals } = useProposals({
    linkedProposalId,
    type: ProposalType.Tender,
    load: !!linkedProposalId && (proposalType === ProposalType.Pitch || proposalType === ProposalType.Tender),
  })

  return {
    tenderProposals: proposals,
    isLoadingTenderProposals: isLoadingProposals,
    hasTenderProcessStarted: hasTenderProcessStarted(proposals?.data),
    winnerTenderProposal: proposals?.data.find((item) => item.status === ProposalStatus.Passed),
  }
}
