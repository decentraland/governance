import { useQuery } from '@tanstack/react-query'

import { DclData } from '../clients/DclData'

import { ONE_DAY_MS } from './constants'

function useVestings(shouldFetch: boolean) {
  const { data, isLoading: isLoadingVestingsData } = useQuery({
    queryKey: ['vestings'],
    queryFn: () => DclData.get().getVestings(),
    staleTime: ONE_DAY_MS,
    enabled: shouldFetch,
  })

  return { data, isLoadingVestingsData }
}

export default useVestings
