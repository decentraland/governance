import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

const useProposalVotes = (proposalId?: ProposalAttributes['id']) => {
  const [votes, votesState] = useAsyncMemo(() => Governance.get().getProposalVotes(proposalId!), [proposalId], {
    callWithTruthyDeps: true,
  })

  return { votes, votesState, isLoadingVotes: votesState.loading }
}

export default useProposalVotes
