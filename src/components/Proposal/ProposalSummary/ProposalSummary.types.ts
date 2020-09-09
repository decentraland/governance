import { Dispatch } from 'redux'

import { App } from 'modules/app/types'
import { Vote } from 'modules/vote/types'
import { CallHistoryMethodAction } from 'connected-react-router'
import { VoteDescription } from 'modules/description/types'

export type DefaultProps = {
  vote: Vote
}

export type Props = DefaultProps & {
  app: App
  creator: App
  description: VoteDescription
  descriptionError: string
  isLoading: boolean
  onNavigate: (path: string) => void
}

export type MapStateProps = Pick<Props, 'app' | 'creator' | 'description' | 'descriptionError' | 'isLoading'>
export type MapDispatchProps = Pick<Props, 'onNavigate'>
export type MapDispatch = Dispatch<CallHistoryMethodAction>
