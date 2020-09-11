import { Dispatch } from 'redux'

import { CallHistoryMethodAction } from 'connected-react-router'
import { CastParams } from 'routing/types'
import { createCastRequest, CreateCastRequestAction } from 'modules/cast/actions'
import { Vote } from 'modules/vote/types'

export type Props = {
  isConnected: boolean
  isConnecting: boolean
  isCreating: boolean
  params: CastParams
  vote?: Vote
  onNavigate: (path: string) => void
  onCreateCast: typeof createCastRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isCreating' | 'params'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onCreateCast'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | CreateCastRequestAction>
