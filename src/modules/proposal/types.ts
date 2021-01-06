import { App } from '@aragon/connect-core'
import { Vote, Voting } from '@aragon/connect-voting'
import { Delay /*, DelayedScript */ } from '@1hive/connect-delay'
export type Delaying = App & Delay

export enum ProposalType {
  Vote = 'vote',
  DelayScript = 'delay_script'
}

export type AggregatedVote = Vote & {
  proposalType: ProposalType.Vote
  status: ProposalStatus
  identifier: {
    appAddress: string,
    voteId: string
  },
  balance: VoteBalance
}

export type DelayedScript = {
  id: string
  executionTime: number
  pausedAt: number
  evmScript: string
  canExecute: boolean
}

export type AggregatedDelayedScript = DelayedScript & {
  proposalType: ProposalType.DelayScript
  status: ProposalStatus
  script: string
  identifier: {
    appAddress: string,
    scriptId: string
  }
}

export type Proposal = AggregatedVote | AggregatedDelayedScript

export enum ProposalStatus {
  Relevant = 'relevant',
  All = 'all',
  Enacted = 'enacted',
  Passed = 'passed',
  Rejected = 'rejected',
  Progress = 'progress',
  Hidden = 'hidden'
}

export const ProposalCategory = {
  All: 'all',
  Question: 'question',
  Tokens: 'tokens',
  Delay: 'delay',
  Catalyst: 'catalyst',
  Finance: 'finance',
  Agent: 'agent',
  BanName: 'ban_name',
  POI: 'poi',
  System: 'system'
}

export type VoteBalance = {
  approvalRequiredPercentage: number
  approvalRequired: number
  approvalPercentage: number
  supportRequiredPercentage: number
  supportPercentage: number
  totalTokens: number
  yeaPercentage: number
  nayPercentage: number
  yea: number
  nay: number
}

export { Vote, Voting }
