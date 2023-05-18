import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useGrants() {
  const { data, isLoading } = useQuery({
    queryKey: ['grants'],
    queryFn: () => Governance.get().getGrants(),
    staleTime: 60 * 1000,
  })

  return {
    grants: data,
    isLoadingGrants: isLoading,
  }
}
