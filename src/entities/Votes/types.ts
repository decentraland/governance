/* eslint-disable @typescript-eslint/no-explicit-any */
import { SnapshotVote } from '../../clients/SnapshotGraphqlTypes'
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
