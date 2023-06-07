import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'
import { hasTenderProcessStarted } from '../entities/Proposal/utils'

import useProposals from './useProposals'

export function useTenderProposals(
  linkedProposalId?: ProposalAttributes['id'],
  proposalType?: ProposalAttributes['type']
) {
  const { proposals, isLoadingProposals } = useProposals({
    linkedProposalId,
    load: !!linkedProposalId && (proposalType === ProposalType.Pitch || proposalType === ProposalType.Tender),
  })

  return {
    tenderProposals: proposals,
    isLoadingTenderProposals: isLoadingProposals,
    hasTenderProcessStarted: !!proposals?.data && hasTenderProcessStarted(proposals?.data),
  }
}
