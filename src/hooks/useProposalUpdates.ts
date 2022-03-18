import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { Governance } from "../api/Governance"

export default function useProposalUpdates(proposalId?: string | null) {
  const [updates] = useAsyncMemo(() => Governance.get().getProposalUpdates(proposalId!), [proposalId], {
    callWithTruthyDeps: true,
  })

  return {
    publicUpdates: updates?.publicUpdates,
    nextUpdate: updates?.nextUpdate
  }
}
