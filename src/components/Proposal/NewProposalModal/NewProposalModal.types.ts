import { Dispatch } from 'redux'

import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { CallHistoryMethodAction } from 'connected-react-router'
import { NewProposalParams } from 'routing/types'
import { createQuestionRequest, createBanRequest, createPoiRequest, createCatalystRequest, CreateQuestionRequestAction, CreateBanRequestAction, CreatePoiRequestAction, CreateCatalystRequestAction } from 'modules/vote/actions'

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  isCreating: boolean
  params: NewProposalParams
  onConnect: typeof connectWalletRequest
  onChangeParams: (options?: NewProposalParams) => void
  onCreateQuestion: typeof createQuestionRequest
  onCreateBan: typeof createBanRequest
  onCreatePoi: typeof createPoiRequest
  onCreateCatalyst: typeof createCatalystRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isLoading' | 'isCreating' | 'params'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onChangeParams' | 'onCreateQuestion' | 'onCreateBan' | 'onCreatePoi' | 'onCreateCatalyst'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction | CallHistoryMethodAction | CreateQuestionRequestAction | CreateBanRequestAction | CreatePoiRequestAction | CreateCatalystRequestAction>
