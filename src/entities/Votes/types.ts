import { SnapshotVote } from "../../api/Snapshot"
import { ProposalStatus, ProposalType } from "../Proposal/types"

export type VoteAttributes = {
  proposal_id: string,
  hash: string,
  votes: any,
  created_at: Date,
  updated_at: Date,
}

export type Vote = {
  timestamp: number,
  choice: number,
  vp: number
}

export type VotedProposal = SnapshotVote & {
  proposal: {
    proposal_id: string
    type: ProposalType
    status: ProposalStatus
  }
}

export type ChoiceColor = "approve" | "reject" | number
