import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProposal(proposalId?: string | null) {
  const proposalKey = `proposal#${proposalId}`

  const {
    data: proposal,
    isLoading: isLoadingProposal,
    isError: isErrorOnProposal,
  } = useQuery({
    queryKey: [proposalKey],
    queryFn: async () => {
      if (!proposalId) {
        return null
      }
      return Governance.get().getProposal(proposalId)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return { proposal: proposal || null, isLoadingProposal, isErrorOnProposal, proposalKey }
}
