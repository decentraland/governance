import { Dispatch } from 'redux'
import { NavbarProps } from 'decentraland-ui'
import { enableWalletRequest, EnableWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'

export type Props = Partial<NavbarProps> & {
  isConnected: boolean
  isConnecting: boolean
  onConnect: typeof enableWalletRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<EnableWalletRequestAction>
