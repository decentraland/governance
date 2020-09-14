import { Dispatch } from 'redux'

import { AggregatedVote } from 'modules/vote/types'
import { CallHistoryMethodAction } from 'connected-react-router'
import { VoteDescription } from 'modules/description/types'

export type DefaultProps = {
  vote: AggregatedVote
}

export type Props = DefaultProps & {
  description: VoteDescription
  descriptionError: string
  isLoading: boolean
  onNavigate: (path: string, replace?: boolean) => void
}

export type MapStateProps = Pick<Props, 'description' | 'descriptionError' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
