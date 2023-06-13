import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

const useProposalComments = (proposalId?: ProposalAttributes['id']) => {
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`proposalComments#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return null
      }
      return Governance.get().getProposalComments(proposalId)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return { comments, isLoadingComments }
}

export default useProposalComments
