import { Cast } from '@aragon/connect-voting'
import { Balance } from 'modules/balance/type'
import { AggregatedVote } from 'modules/proposal/types'

export type DefaultProps = {
  vote: AggregatedVote
}

export type Props = DefaultProps & {
  casts?: Cast[]
  cast?: Cast
  balance?: Balance
  isLoading?: boolean
  onClickApprove: (event: React.MouseEvent<any>, vote: AggregatedVote) => void
  onClickReject: (event: React.MouseEvent<any>, vote: AggregatedVote) => void
  onClickEnact: (event: React.MouseEvent<any>, vote: AggregatedVote) => void
}

export type MapStateProps = Pick<Props, 'cast' | 'casts' | 'balance' | 'isLoading'>
export type MapDispatchProps = {}
export type MapDispatch = {}
