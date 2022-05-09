import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { Governance } from "../api/Governance"

export default function useProposalUpdates(proposalId?: string | null) {
  const [updates, state] = useAsyncMemo(() => Governance.get().getProposalUpdates(proposalId!), [proposalId], {
    callWithTruthyDeps: true,
  })

  return {
    publicUpdates: updates?.publicUpdates,
    pendingUpdates: updates?.pendingUpdates,
    nextUpdate: updates?.nextUpdate,
    currentUpdate: updates?.currentUpdate,
    state,
  }
}
