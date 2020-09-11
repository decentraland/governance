import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Vote } from 'modules/vote/types'
import { VoteDescription } from 'modules/description/types'
import { Cast } from '@aragon/connect-voting'
import { loadCastsRequest, LoadCastsRequestAction } from 'modules/cast/actions'
import { CallHistoryMethodAction } from 'connected-react-router'

export type DefaultProps = {}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  vote?: Vote
  description?: VoteDescription
  casts?: Cast[]
  cast?: Cast
  onNavigate: (path: string) => void
  onConnect: typeof connectWalletRequest
  onRequireCasts: typeof loadCastsRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isEnabling' | 'isLoading' | 'vote' | 'description' | 'casts' | 'cast'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onRequireCasts' | 'onNavigate'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction | LoadCastsRequestAction | CallHistoryMethodAction>
