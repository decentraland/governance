import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'

export default function useProposalUpdate(updateId?: string | null) {
  const [update, state] = useAsyncMemo(() => Governance.get().getProposalUpdate(updateId!), [updateId], {
    callWithTruthyDeps: true,
  })

  return {
    update,
    state,
  }
}
