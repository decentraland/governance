import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { CategorizedGrants } from '../entities/Proposal/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

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
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return useMemo(() => {
    if (!grants) return []
    return [...grants.current, ...grants.past]
  }, [grants])
}
