import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProjects(from?: Date, to?: Date) {
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', from, to],
    queryFn: async () => Governance.get().getProjects(from, to),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    projects,
    isLoadingProjects,
  }
}
