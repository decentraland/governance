import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Vote } from 'modules/vote/types'

export type DefaultProps = {}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  vote?: Vote
  onConnect: typeof connectWalletRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isEnabling' | 'isLoading' | 'vote'>
export type MapDispatchProps = Pick<Props, 'onConnect'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction>
