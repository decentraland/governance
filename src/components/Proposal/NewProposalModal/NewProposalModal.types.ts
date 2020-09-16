import { Dispatch } from 'redux'

import { enableWalletRequest, EnableWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { CallHistoryMethodAction } from 'connected-react-router'
import { FilterProposalParams, NewProposalParams } from 'routing/types'
import { createQuestionRequest, createBanRequest, createPoiRequest, createCatalystRequest, CreateQuestionRequestAction, CreateBanRequestAction, CreatePoiRequestAction, CreateCatalystRequestAction } from 'modules/proposal/actions'
import { Wallet } from 'modules/wallet/types'

export type DefaultProps = {
}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  isCreating: boolean
  isEnabling: boolean
  params: NewProposalParams & FilterProposalParams
  wallet: Wallet | null
  onConnect: typeof enableWalletRequest
  onNavigate: (path: string, replace?: boolean) => void
  onCreateQuestion: typeof createQuestionRequest
  onCreateBan: typeof createBanRequest
  onCreatePoi: typeof createPoiRequest
  onCreateCatalyst: typeof createCatalystRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isLoading' | 'isCreating' | 'isEnabling' | 'params' | 'wallet'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onNavigate' | 'onCreateQuestion' | 'onCreateBan' | 'onCreatePoi' | 'onCreateCatalyst'>
export type MapDispatch = Dispatch<EnableWalletRequestAction | CallHistoryMethodAction | CreateQuestionRequestAction | CreateBanRequestAction | CreatePoiRequestAction | CreateCatalystRequestAction>
