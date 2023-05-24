import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useGrants() {
  const { data, isLoading } = useQuery({
    queryKey: ['grants'],
    queryFn: () => Governance.get().getGrants(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    grants: data,
    isLoadingGrants: isLoading,
  }
}
