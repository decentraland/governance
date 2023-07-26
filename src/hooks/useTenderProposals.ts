import { ProposalAttributes, ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { hasTenderProcessFinished, hasTenderProcessStarted } from '../entities/Proposal/utils'

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
    hasTenderProcessStarted: !!proposals?.data && hasTenderProcessStarted(proposals?.data),
    hasTenderProcessFinished: !!proposals?.data && hasTenderProcessFinished(proposals?.data),
    winnerTenderProposal: proposals?.data.find((item) => item.status === ProposalStatus.Passed),
  }
}
