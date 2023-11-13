import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'
import { Vote, VoteSegmentation } from '../entities/Votes/types'
import { getVoteSegmentation } from '../entities/Votes/utils'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useProposalsCachedVotes(proposalIds: ProposalAttributes['id'][]) {
  const { data: votes, isLoading: isLoadingVotes } = useQuery({
    queryKey: [`proposalsVotes#${proposalIds.join('-')}`],
    queryFn: () => Governance.get().getCachedVotesByProposals(proposalIds),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const segmentedVotes = votes
    ? Object.entries(votes).reduce((acc, [proposalId, voteMap]) => {
        acc[proposalId] = getVoteSegmentation(voteMap)

        return acc
      }, {} as Record<string, VoteSegmentation<Vote>>)
    : undefined

  return { votes, segmentedVotes, isLoadingVotes }
}

export default useProposalsCachedVotes
