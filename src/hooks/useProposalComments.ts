import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

const useProposalComments = (proposalId?: ProposalAttributes['id']) => {
  const [comments, state] = useAsyncMemo(
    async () => (proposalId ? Governance.get().getProposalComments(proposalId) : null),
    [proposalId]
  )

  return { comments, isLoadingComments: state.loading }
}

export default useProposalComments
