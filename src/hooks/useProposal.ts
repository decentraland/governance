import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'

export default function useProposal(proposalId?: string | null) {
  return useAsyncMemo(() => Governance.get().getProposal(proposalId!), [proposalId], { callWithTruthyDeps: true })
}
