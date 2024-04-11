/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'

import { SnapshotVote } from '../../clients/SnapshotTypes'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../Proposal/types'

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
} & Pick<SnapshotVote, 'metadata' | 'reason'>

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

export type VotesForProposals = Record<ProposalAttributes['id'], VoteByAddress>

export type VoteSegmentation<T> = {
  highQualityVotes: Record<string, T>
  lowQualityVotes: Record<Voter['address'], T>
}

export type Participation = { last30Days: number; lastWeek: number }

export const reasonSchema = z.object({
  reason: z.string().min(10).max(140),
})

export type Reason = z.infer<typeof reasonSchema>
