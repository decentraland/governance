import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProposalUpdate(updateId?: string | null) {
  const {
    data: update,
    isLoading: isLoadingUpdate,
    isError: isErrorOnUpdate,
    refetch: refetchUpdate,
  } = useQuery({
    queryKey: [`proposalUpdate#${updateId}`],
    queryFn: async () => {
      if (!updateId) {
        return null
      }
      return Governance.get().getProposalUpdate(updateId)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
    enabled: !!updateId,
  })

  return {
    update,
    isLoadingUpdate,
    isErrorOnUpdate,
    refetchUpdate,
  }
}
