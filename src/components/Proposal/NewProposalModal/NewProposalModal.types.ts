import { Dispatch } from 'redux'

import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { CallHistoryMethodAction } from 'connected-react-router'
import { NewProposalParams } from 'routing/types'

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  params: NewProposalParams
  onConnect: typeof connectWalletRequest
  onChangeParams: (options?: NewProposalParams) => void
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isLoading' | 'params'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onChangeParams'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction | CallHistoryMethodAction>
