import { ProposalAttributes, ProposalType } from '../entities/Proposal/types'

import useProposals from './useProposals'

export function useTenderProposals(
  pitchProposalId?: ProposalAttributes['id'],
  proposalType?: ProposalAttributes['type']
) {
  const { proposals, isLoadingProposals } = useProposals({
    linkedProposalId: pitchProposalId,
    load: proposalType === ProposalType.Pitch,
  })

  return {
    tenderProposals: proposals,
    isLoadingTenderProposals: isLoadingProposals,
  }
}
