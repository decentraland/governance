import { Dispatch } from 'redux'
import { enableWalletRequest, EnableWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'modules/wallet/types'

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  wallet: Wallet | null | undefined
  onConnect: typeof enableWalletRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isEnabling' | 'isLoading' | 'wallet'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<EnableWalletRequestAction>
