import { Vote as AragonVote } from '@aragon/connect-thegraph-voting'

export type Vote = AragonVote & {
  description: string
  appAddress: string
}

export { AragonVote }
