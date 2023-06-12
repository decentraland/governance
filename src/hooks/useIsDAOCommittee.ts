import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

export default function useIsDAOCommittee(address?: string | null) {
  const { data: committeeAddresses } = useQuery({
    queryKey: [`committee`],
    queryFn: () => Governance.get().getCommittee(),
    staleTime: 3.6e6, // 1 hour
  })

  const isDAOCommittee = useMemo(() => {
    return !!(address && committeeAddresses && committeeAddresses.includes(address))
  }, [address, committeeAddresses])

  return { isDAOCommittee }
}
