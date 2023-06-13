import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useProposalUpdates(proposalId?: string | null) {
  const {
    data: updates,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [`proposalUpdates#${proposalId}`],
    queryFn: async () => {
      if (!proposalId) {
        return undefined
      }
      return Governance.get().getProposalUpdates(proposalId)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    publicUpdates: updates?.publicUpdates,
    pendingUpdates: updates?.pendingUpdates,
    nextUpdate: updates?.nextUpdate,
    currentUpdate: updates?.currentUpdate,
    isLoading,
    isError,
    refetchUpdates: refetch,
  }
}
