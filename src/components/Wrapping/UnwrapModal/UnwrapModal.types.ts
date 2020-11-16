import { Dispatch } from 'redux'

import { CallHistoryMethodAction } from 'connected-react-router'
import { UnwrapParams } from 'routing/types'
import { unwrapManaRequest, UnwrapManaRequestAction } from 'modules/wallet/actions'
import { Wallet } from 'modules/wallet/types'

export type State = {
  value?: number | ''
}

export type Props = {
  isConnected: boolean
  isConnecting: boolean
  isWrappingMana: boolean
  isUnwrappingMana: boolean
  params: UnwrapParams
  wallet: Wallet | null | undefined
  onNavigate: (path: string, replace?: boolean) => void
  onUnwrapToken: typeof unwrapManaRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isUnwrappingMana' | 'isWrappingMana' | 'params' | 'wallet'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onUnwrapToken'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | UnwrapManaRequestAction>
