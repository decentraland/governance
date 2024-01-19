import { useQuery } from '@tanstack/react-query'

import { Transparency } from '../clients/Transparency'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

type Options = {
  shouldRevalidate?: boolean
}

function useTransparency({ shouldRevalidate }: Options = {}) {
  const { data, isLoading: isLoadingTransparencyData } = useQuery({
    queryKey: ['transparencyData'],
    queryFn: () => Transparency.getData(),
    staleTime: shouldRevalidate ? 0 : DEFAULT_QUERY_STALE_TIME,
  })

  return { data, isLoadingTransparencyData }
}

export default useTransparency
