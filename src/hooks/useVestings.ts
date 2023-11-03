import { useQuery } from '@tanstack/react-query'

import { DclData } from '../clients/DclData'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useVestings(shouldFetch: boolean) {
  const { data, isLoading: isLoadingVestingsData } = useQuery({
    queryKey: ['vestings'],
    queryFn: () => DclData.get().getVestings(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
    enabled: shouldFetch,
  })

  return { data, isLoadingVestingsData }
}

export default useVestings
