import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import loader from "../modules/loader"

export default function useProposal(proposalId?: string | null) {
  return useAsyncMemo(() => loader.proposals.load(proposalId!), [proposalId], { callWithTruthyDeps: true })
}