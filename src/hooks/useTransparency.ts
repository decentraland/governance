import { useQuery } from '@tanstack/react-query'

import { DclData } from '../clients/DclData'

type Options = {
  shouldRevalidate?: boolean
}

function useTransparency({ shouldRevalidate }: Options = {}) {
  const { data, isLoading: isLoadingTransparencyData } = useQuery({
    queryKey: ['transparency-data'],
    queryFn: () => DclData.get().getData(),
    staleTime: shouldRevalidate ? 0 : 120 * 1000,
  })

  return { data, isLoadingTransparencyData }
}

export default useTransparency
