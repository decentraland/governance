import { Dispatch } from 'redux'

import { CallHistoryMethodAction } from 'connected-react-router'
import { UnwrapParams } from 'routing/types'
import { unwrapManaRequest, UnwrapManaRequestAction } from 'modules/wallet/actions'

export type State = {
  value?: number
}

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isWrappingMana: boolean
  isUnwrappingMana: boolean
  params: UnwrapParams
  onNavigate: (path: string) => void
  onUnwrapToken: typeof unwrapManaRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isUnwrappingMana' | 'isWrappingMana' | 'params'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onUnwrapToken'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | UnwrapManaRequestAction>
