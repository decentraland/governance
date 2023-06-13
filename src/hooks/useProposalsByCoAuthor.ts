import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { CoauthorStatus } from '../entities/Coauthor/types'

function useProposalsByCoAuthor(coauthor?: string | null, status?: CoauthorStatus) {
  const { data: requestsStatus, isLoading } = useQuery({
    queryKey: [`proposalsByCoAuthor#${coauthor}#${status}`],
    queryFn: async () => {
      if (!coauthor) {
        return []
      }
      return Governance.get().getProposalsByCoAuthor(coauthor, status)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    requestsStatus: requestsStatus ?? [],
    isLoading,
  }
}

export default useProposalsByCoAuthor
