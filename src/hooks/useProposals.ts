import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { Governance } from "../api/Governance"

export default function useProposals() {
  return useAsyncMemo(() => Governance.get().getProposals(), [], { callWithTruthyDeps: true })
}