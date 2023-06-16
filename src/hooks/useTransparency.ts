import { useQuery } from '@tanstack/react-query'

import { DclData } from '../clients/DclData'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

type Options = {
  shouldRevalidate?: boolean
}

function useTransparency({ shouldRevalidate }: Options = {}) {
  const { data, isLoading: isLoadingTransparencyData } = useQuery({
    queryKey: ['transparencyData'],
    queryFn: () => DclData.get().getData(),
    staleTime: shouldRevalidate ? 0 : DEFAULT_QUERY_STALE_TIME,
  })

  return { data, isLoadingTransparencyData }
}

export default useTransparency
