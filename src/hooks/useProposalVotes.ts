import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

import { FIVE_MINUTES_MS } from './constants'

const useProposalVotes = (proposalId?: ProposalAttributes['id']) => {
  const {
    data: votes,
    isLoading: isLoadingVotes,
    refetch: reloadVotes,
  } = useQuery({
    queryKey: [`proposalVotes#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return null
      }
      return Governance.get().getProposalCachedVotes(proposalId)
    },
    staleTime: FIVE_MINUTES_MS,
  })

  return { votes: votes ?? null, isLoadingVotes, reloadVotes }
}

export default useProposalVotes
