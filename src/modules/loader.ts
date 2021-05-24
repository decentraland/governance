import Loader from "decentraland-gatsby/dist/utils/loader/Loader"
import { Governance } from "../api/Governance"
import { ProposalAttributes } from "../entities/Proposal/types"

const proposals = new Loader<ProposalAttributes | null>((proposalId) => {
  return Governance.get().getProposal(String(proposalId))
})

export async function cacheProposals(loader: Promise<ProposalAttributes[]>) {
  const list = await loader
  for (const proposal of list) {
    proposals.set(proposal.snapshot_id, proposal)
  }

  return list
}

export default  { proposals }