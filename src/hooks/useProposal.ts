import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

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
    staleTime: 3.6e6, // 1 hour
  })

  return { proposal: proposal || null, isLoadingProposal, isErrorOnProposal, proposalKey }
}
