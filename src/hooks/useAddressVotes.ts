import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useAddressVotes(address: string | null) {
  const { data: votes, isLoading } = useQuery({
    queryKey: [`addressVotes#${address}`],
    queryFn: async () => {
      if (address) {
        return Governance.get().getAddressesVotes([address])
      }
    },
    enabled: !!address,
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    votes,
    isLoadingVotes: isLoading,
  }
}
