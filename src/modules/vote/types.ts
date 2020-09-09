import type { Vote as AragonVote, Cast } from '@aragon/connect-voting'
import ForwardingPathDescription from '@aragon/connect-core/dist/cjs/utils/descriptor'

export type Vote = AragonVote & {
  description?: string
  descriptionPath?: ForwardingPathDescription
  casted?: Cast[]
}

export { AragonVote }
