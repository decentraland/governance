import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useParticipation() {
  const { data: participation, isLoading } = useQuery({
    queryKey: [`participation`],
    queryFn: async () => {
      return await Governance.get().getParticipation()
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    participation,
    isLoadingParticipation: isLoading,
  }
}
