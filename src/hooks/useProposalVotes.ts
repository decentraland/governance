import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

const useProposalVotes = (proposalId?: ProposalAttributes['id']) => {
  const {
    data: votes,
    isLoading: isLoadingVotes,
    refetch: reloadVotes,
  } = useQuery({
    queryKey: [`proposalVotes#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return undefined
      }
      return Governance.get().getProposalVotes(proposalId)
    },
    staleTime: 3e5, // 5 minutes
  })

  return { votes: votes ?? null, isLoadingVotes, reloadVotes }
}

export default useProposalVotes
