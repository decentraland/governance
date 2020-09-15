import { Vote } from '@aragon/connect-voting'

export type AggregatedVote = Vote & {
  status: VoteStatus
  identifier: {
    appAddress: string,
    voteId: string
  },
  balance: VoteBalance
}

export enum VoteStatus {
  All = 'all',
  Enacted = 'enacted',
  Passed = 'passed',
  Rejected = 'rejected',
  Progress = 'progress'
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

export { Vote }
