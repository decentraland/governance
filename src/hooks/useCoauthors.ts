import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { CoauthorStatus } from '../entities/Coauthor/types'

function useCoauthors(proposalId: string, status?: CoauthorStatus) {
  const { data: coAuthors } = useQuery({
    queryKey: [`coauthors-${proposalId}`],
    queryFn: () => Governance.get().getCoAuthorsByProposal(proposalId, status),
  })
  return coAuthors ?? []
}

export default useCoauthors
