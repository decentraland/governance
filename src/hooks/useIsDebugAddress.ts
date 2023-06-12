import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useIsDebugAddress(address?: string | null) {
  const { data: debugAddresses } = useQuery({
    queryKey: ['debugAddresses'],
    queryFn: async () => Governance.get().getDebugAddresses(),
    staleTime: 3.6e6, // 1 hour
  })

  const isDebugAddress = useMemo(() => {
    return !!(address && debugAddresses && debugAddresses.includes(address))
  }, [address, debugAddresses])

  return { isDebugAddress }
}
