import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { CategorizedGrants } from '../entities/Proposal/types'

export default function useGrantsByUser(address: string | null, coauthoring?: boolean) {
  const initialValue: CategorizedGrants = { current: [], past: [], total: 0 }
  const { data: grants } = useQuery({
    queryKey: ['grants', address, coauthoring],
    queryFn: async () => {
      if (!address) {
        return initialValue
      }

      return await Governance.get().getGrantsByUser(address, coauthoring)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return useMemo(() => {
    if (!grants) return []
    return [...grants.current, ...grants.past]
  }, [grants])
}
