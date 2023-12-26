import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { ONE_DAY_MS } from './constants'

function useVestings(shouldFetch: boolean) {
  const { data, isLoading: isLoadingVestingsData } = useQuery({
    queryKey: ['vestings'],
    queryFn: () => Governance.get().getAllVestings(),
    staleTime: ONE_DAY_MS,
    enabled: shouldFetch,
  })

  return { data, isLoadingVestingsData }
}

export default useVestings
