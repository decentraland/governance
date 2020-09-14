import { Vote } from '@aragon/connect-voting'

export type AggregatedVote = Vote & {
  status: VoteStatus
  identifier: {
    appAddress: string,
    voteId: string
  },
  balance: {
    acceptRequiredPercentage: number
    supportRequiredPercentage: number
    supportRequired: number
    acceptRequired: number
    acceptPercentage: number
    supportPercentage: number
    votingPower: number
    yeaPercentage: number
    nayPercentage: number
    yea: number
    nay: number
  }
}

export enum VoteStatus {
  All = 'all',
  Enacted = 'enacted',
  Passed = 'passed',
  Rejected = 'rejected',
  Progress = 'progress'
}

export { Vote }
