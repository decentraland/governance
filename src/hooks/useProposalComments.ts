import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

const useProposalComments = (proposalId?: ProposalAttributes['id'], shouldFetch = true) => {
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`proposalComments#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return null
      }
      return Governance.get().getProposalComments(proposalId)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
    enabled: shouldFetch,
  })

  return { comments, isLoadingComments }
}

export default useProposalComments
