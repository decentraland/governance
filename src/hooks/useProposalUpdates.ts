import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

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
    staleTime: DEFAULT_QUERY_STALE_TIME,
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
