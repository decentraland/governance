import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useIsDebugAddress(address?: string | null) {
  const { data: debugAddresses } = useQuery({
    queryKey: ['debugAddresses'],
    queryFn: () => Governance.get().getDebugAddresses(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const isDebugAddress = useMemo(() => {
    return !!(address && debugAddresses && debugAddresses.includes(address))
  }, [address, debugAddresses])

  return { isDebugAddress }
}
