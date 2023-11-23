import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function usePriorityProposals(address?: string | null) {
  const { data: priorityProposals, isLoading } = useQuery({
    queryKey: [`priorityProposals#${address}`],
    queryFn: async () => {
      if (address && !isEthereumAddress(address)) {
        return []
      }
      return await Governance.get().getPriorityProposals(address || undefined)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    priorityProposals,
    isLoading,
  }
}

export default usePriorityProposals
