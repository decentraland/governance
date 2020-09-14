import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'modules/wallet/types'
import { allowLandRequest, allowEstateRequest, AllowLandRequestAction, AllowEstateRequestAction, wrapManaRequest, WrapManaRequestAction, allowManaRequest, AllowManaRequestAction } from 'modules/wallet/actions'
import { CallHistoryMethodAction } from 'connected-react-router'

export type State = {
  value?: number
}

export type DefaultProps = {}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  isAllowingMana: boolean
  isAllowingLand: boolean
  isAllowingEstate: boolean
  isWrappingMana: boolean
  isUnwrappingMana: boolean
  wallet: Wallet | null | undefined
  onConnect: typeof connectWalletRequest
  onNavigate: (path: string, replace?: boolean) => void
  onWrapMana: typeof wrapManaRequest
  onUnwrapMana: typeof wrapManaRequest
  onAllowMana: typeof allowManaRequest
  onAllowLand: typeof allowLandRequest
  onAllowEstate: typeof allowEstateRequest
}

export type MapStateProps = Pick<Props,
  | 'isConnected'
  | 'isConnecting'
  | 'isEnabling'
  | 'isLoading'
  | 'isAllowingMana'
  | 'isAllowingLand'
  | 'isAllowingEstate'
  | 'isWrappingMana'
  | 'isUnwrappingMana'
  | 'wallet'
>
export type MapDispatchProps = Pick<Props,
 | 'onConnect'
 | 'onNavigate'
 | 'onAllowLand'
 | 'onAllowEstate'
 | 'onAllowMana'
 | 'onWrapMana'
 | 'onUnwrapMana'
>
export type MapDispatch = Dispatch<
 | ConnectWalletRequestAction
 | CallHistoryMethodAction
 | AllowEstateRequestAction
 | AllowLandRequestAction
 | AllowManaRequestAction
 | WrapManaRequestAction
>
