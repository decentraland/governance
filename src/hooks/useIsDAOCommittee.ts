import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useIsDAOCommittee(address?: string | null) {
  const { data: committeeAddresses } = useQuery({
    queryKey: [`committee`],
    queryFn: () => Governance.get().getCommittee(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const isDAOCommittee = useMemo(() => {
    return !!(address && committeeAddresses && committeeAddresses.includes(address))
  }, [address, committeeAddresses])

  return { isDAOCommittee }
}
