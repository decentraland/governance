/* eslint-disable @typescript-eslint/no-explicit-any */
import { SnapshotVote } from '../../clients/SnapshotTypes'
import { ProposalStatus, ProposalType } from '../Proposal/types'

export type VoteAttributes = {
  proposal_id: string
  hash: string
  votes: any
  created_at: Date
  updated_at: Date
}

export type Vote = {
  timestamp: number
  choice: number
  vp: number
} & Pick<SnapshotVote, 'metadata'>

export type VoteByAddress = Record<string, Vote>

export type VotedProposal = SnapshotVote & {
  id: string
  proposal: {
    proposal_id: string
    type: ProposalType
    status: ProposalStatus
    author: string
    finish_at: number
    scores: number[]
  }
}

export type ChoiceColor = 'approve' | 'reject' | number

export type SelectedVoteChoice = { choice?: string; choiceIndex?: number }

export type VoteCount = {
  votes: number
  lastVoted: number
}

export type Voter = {
  address: string
} & VoteCount

export type VotesForProposals = Record<string, VoteByAddress>

export type VoteSegmentation<T> = {
  highQualityVotes: Record<string, T>
  lowQualityVotes: Record<string, T>
}
