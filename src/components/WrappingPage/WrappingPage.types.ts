import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'

export type DefaultProps = {}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  onConnect: typeof connectWalletRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction>
