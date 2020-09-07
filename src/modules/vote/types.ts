import type { Vote as AragonVote, Cast } from '@aragon/connect-voting'
import type TransactionRequest from '@aragon/connect-core/dist/cjs/transactions/TransactionRequest'

export type Vote = AragonVote & {
  appAddress: string
  description: string
  casted: Cast[]
  transactions: TransactionRequest[]
}

export { AragonVote }
