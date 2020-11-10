import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Proposal } from 'modules/proposal/types'
import { ProposalDescription } from 'modules/description/types'
import { Cast } from '@aragon/connect-voting'
import { loadCastsRequest, LoadCastsRequestAction } from 'modules/cast/actions'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'modules/wallet/types'
import { loadBalanceRequest, LoadBalanceRequestAction } from 'modules/balance/actions'
import { Balance } from 'modules/balance/type'
import { executeScriptRequest, ExecuteScriptRequestAction, executeVoteRequest, ExecuteVoteRequestAction } from 'modules/proposal/actions'

export type Props = {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  isPending: boolean
  isExecuting: boolean
  canGoBack: boolean
  executed: boolean
  proposal?: Proposal
  description?: ProposalDescription
  casts?: Cast[]
  cast?: Cast
  wallet?: Wallet | null
  balance?: Balance
  onNavigate: (path: string, replace?: boolean) => void
  onBack: () => void
  onHome: () => void
  onConnect: typeof connectWalletRequest
  onRequireCasts: typeof loadCastsRequest
  onRequireBalance: typeof loadBalanceRequest
  onExecuteVote: typeof executeVoteRequest
  onExecuteScript: typeof executeScriptRequest
}

export type MapStateProps = Pick<Props,
 | 'isConnected'
 | 'isConnecting'
 | 'isEnabling'
 | 'isLoading'
 | 'isPending'
 | 'isExecuting'
 | 'canGoBack'
 | 'executed'
 | 'proposal'
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
 | 'onExecuteScript'
 | 'onExecuteVote'
 | 'onNavigate'
 | 'onBack'
 | 'onHome'
>

export type MapDispatch = Dispatch<
 | ConnectWalletRequestAction
 | LoadCastsRequestAction
 | LoadBalanceRequestAction
 | CallHistoryMethodAction
 | ExecuteVoteRequestAction
 | ExecuteScriptRequestAction
>
