import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { CoauthorStatus } from '../entities/Coauthor/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useProposalsByCoAuthor(coauthor?: string | null, status?: CoauthorStatus) {
  const { data: requestsStatus, isLoading } = useQuery({
    queryKey: [`proposalsByCoAuthor#${coauthor}#${status}`],
    queryFn: async () => {
      if (!coauthor) {
        return []
      }
      return Governance.get().getProposalsByCoAuthor(coauthor, status)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    requestsStatus: requestsStatus ?? [],
    isLoading,
  }
}

export default useProposalsByCoAuthor
