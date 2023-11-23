import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'
import { getVoteSegmentation } from '../entities/Votes/utils'

import { FIVE_MINUTES_MS } from './constants'

const useProposalVotes = (proposalId?: ProposalAttributes['id'], shouldFetch = true) => {
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
      return Governance.get().getVotesByProposal(proposalId)
    },
    staleTime: FIVE_MINUTES_MS,
    enabled: !!proposalId && shouldFetch,
  })

  const segmentedVotes = votes ? getVoteSegmentation(votes) : undefined

  return { votes, segmentedVotes, isLoadingVotes, reloadVotes }
}

export default useProposalVotes
