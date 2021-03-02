import { Dispatch } from 'redux'
import { enableWalletRequest, EnableWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Proposal } from 'modules/proposal/types'
import { CallHistoryMethodAction } from 'connected-react-router'
import { NewProposalParams, FilterProposalParams } from 'routing/types'

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  proposals: Proposal[] | null
  params: NewProposalParams & FilterProposalParams
  onConnect: typeof enableWalletRequest
  onChangeParams: (options?: NewProposalParams & FilterProposalParams) => void
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isLoading' | 'proposals' | 'params'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onChangeParams'>
export type MapDispatch = Dispatch<EnableWalletRequestAction | CallHistoryMethodAction>
