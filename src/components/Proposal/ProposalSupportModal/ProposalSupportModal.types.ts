import { Dispatch } from 'redux'

import { CallHistoryMethodAction } from 'connected-react-router'
import { CastParams } from 'routing/types'
import { createCastRequest, CreateCastRequestAction } from 'modules/cast/actions'
import { Proposal } from 'modules/proposal/types'
import { enableWalletRequest, EnableWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Cast } from '@aragon/connect-voting'

export type Props = {
  isConnected: boolean
  isConnecting: boolean
  isCreating: boolean
  isEnabling: boolean
  params: CastParams
  proposal?: Proposal
  cast?: Cast
  onNavigate: (path: string, replace?: boolean) => void
  onCreateCast: typeof createCastRequest
  onConnect: typeof enableWalletRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isCreating' | 'isEnabling' | 'params'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onCreateCast' | 'onConnect'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | CreateCastRequestAction | EnableWalletRequestAction>
