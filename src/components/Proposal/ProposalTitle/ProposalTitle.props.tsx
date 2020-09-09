import { Vote } from '@aragon/connect-voting'
import { VoteDescription } from 'modules/description/types'

export type Props = {
  vote?: Vote
  description?: VoteDescription
}
