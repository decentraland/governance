import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { Governance } from "../api/Governance"

export default function useProposalUpdates(proposalId?: string | null) {
  return useAsyncMemo(() => Governance.get().getProposalUpdates(proposalId!), [proposalId], {
    callWithTruthyDeps: true,
  })
}
