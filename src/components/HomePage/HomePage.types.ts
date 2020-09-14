import { Dispatch } from 'redux'

import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { AggregatedVote } from 'modules/vote/types'
import { CallHistoryMethodAction } from 'connected-react-router'
import { NewProposalParams, FilterProposalParams } from 'routing/types'

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  votes: AggregatedVote[] | null
  params: NewProposalParams & FilterProposalParams
  onConnect: typeof connectWalletRequest
  onChangeParams: (options?: NewProposalParams & FilterProposalParams) => void
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isLoading' | 'votes' | 'params'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onChangeParams'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction | CallHistoryMethodAction>
