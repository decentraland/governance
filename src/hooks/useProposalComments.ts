import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

const useProposalComments = (proposalId?: ProposalAttributes['id']) => {
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`proposalComments#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return null
      }
      return Governance.get().getProposalComments(proposalId)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return { comments, isLoadingComments }
}

export default useProposalComments
