import { Vote } from '@aragon/connect-voting'
import { VoteDescription } from 'modules/description/types'
import { Network } from 'modules/wallet/types'

export type DefaultProps = {
  vote?: Vote
}

export type Props = DefaultProps & {
  description?: VoteDescription
  network: Network
}

export type MapStateProps = Pick<Props, 'description' | 'network'>
export type MapDispatchProps = {}
export type MapDispatch = {}
