import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { AggregatedVote } from 'modules/vote/types'
import { VoteDescription } from 'modules/description/types'
import { Cast } from '@aragon/connect-voting'
import { loadCastsRequest, LoadCastsRequestAction } from 'modules/cast/actions'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'modules/wallet/types'
import { loadBalanceRequest, LoadBalanceRequestAction } from 'modules/balance/actions'
import { Balance } from 'modules/balance/type'

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
  wallet?: Wallet | null
  balance?: Balance
  onNavigate: (path: string, replace?: boolean) => void
  onBack: () => void
  onConnect: typeof connectWalletRequest
  onRequireCasts: typeof loadCastsRequest
  onRequireBalance: typeof loadBalanceRequest
}

export type MapStateProps = Pick<Props,
 | 'isConnected'
 | 'isConnecting'
 | 'isEnabling'
 | 'isLoading'
 | 'isPending'
 | 'vote'
 | 'description'
 | 'casts'
 | 'cast'
 | 'balance'
 | 'wallet'
>
export type MapDispatchProps = Pick<Props,
 | 'onConnect'
 | 'onRequireCasts'
 | 'onRequireBalance'
 | 'onNavigate'
 | 'onBack'
>

export type MapDispatch = Dispatch<
 | ConnectWalletRequestAction
 | LoadCastsRequestAction
 | LoadBalanceRequestAction
 | CallHistoryMethodAction
>
