import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { AggregatedVote } from 'modules/vote/types'
import { VoteDescription } from 'modules/description/types'
import { Cast } from '@aragon/connect-voting'
import { loadCastsRequest, LoadCastsRequestAction } from 'modules/cast/actions'
import { CallHistoryMethodAction } from 'connected-react-router'

export type Props = {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  isPending: boolean
  vote?: AggregatedVote
  description?: VoteDescription
  casts?: Cast[]
  cast?: Cast
  onNavigate: (path: string) => void
  onBack: () => void
  onConnect: typeof connectWalletRequest
  onRequireCasts: typeof loadCastsRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isEnabling' | 'isLoading' | 'isPending' | 'vote' | 'description' | 'casts' | 'cast'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onRequireCasts' | 'onNavigate' | 'onBack'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction | LoadCastsRequestAction | CallHistoryMethodAction>
