import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useProposalUpdate(updateId?: string | null) {
  const {
    data: update,
    isLoading: isLoadingUpdate,
    isError: isErrorOnUpdate,
  } = useQuery({
    queryKey: [`proposalUpdate#${updateId}`],
    queryFn: async () => {
      if (!updateId) {
        return undefined
      }
      return Governance.get().getProposalUpdate(updateId)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    update,
    isLoadingUpdate,
    isErrorOnUpdate,
  }
}
