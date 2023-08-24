import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProjects() {
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => Governance.get().getProjects(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    projects,
    isLoadingProjects,
  }
}
