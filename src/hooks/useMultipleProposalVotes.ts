import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useMultipleProposalVotes(proposalIds: ProposalAttributes['id'][]) {
  const { data: votes, isLoading: isLoadingVotes } = useQuery({
    queryKey: [`porposalVotes#${proposalIds.join('-')}`],
    queryFn: () => Governance.get().getVotes(proposalIds),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return { votes, isLoadingVotes }
}

export default useMultipleProposalVotes
