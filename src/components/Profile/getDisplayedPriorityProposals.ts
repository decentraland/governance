import { PriorityProposal, PriorityProposalType } from '../../entities/Proposal/types'
import { isSameAddress } from '../../entities/Snapshot/utils'
import { VotesForProposals } from '../../entities/Votes/types'

export function getDisplayedPriorityProposals(
  votes?: VotesForProposals,
  priorityProposals?: PriorityProposal[],
  lowerAddress?: string | null
) {
  return votes && priorityProposals && lowerAddress
    ? priorityProposals?.filter((proposal) => {
        const hasVotedOnMain = votes && lowerAddress && votes[proposal.id] && !!votes[proposal.id][lowerAddress]
        const hasVotedOnLinked =
          proposal.linked_proposals_data &&
          proposal.linked_proposals_data.some(
            (linkedProposal) => votes[linkedProposal.id] && !!votes[linkedProposal.id][lowerAddress]
          )
        const hasAuthoredBid =
          proposal.unpublished_bids_data &&
          proposal.unpublished_bids_data.some((linkedBid) => isSameAddress(linkedBid.author_address, lowerAddress))

        const shouldDisregardAllVotes = proposal.priority_type === PriorityProposalType.PitchWithSubmissions

        const shouldDisregardVotesOnMain =
          proposal.priority_type === PriorityProposalType.PitchOnTenderVotingPhase ||
          proposal.priority_type === PriorityProposalType.TenderWithSubmissions

        const showTheProposal =
          shouldDisregardAllVotes ||
          !((hasVotedOnMain && !shouldDisregardVotesOnMain) || hasVotedOnLinked || hasAuthoredBid)
        return showTheProposal
      })
    : priorityProposals
}
