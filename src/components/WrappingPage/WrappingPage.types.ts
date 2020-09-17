import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'modules/wallet/types'
import { allowLandRequest, allowEstateRequest, AllowLandRequestAction, AllowEstateRequestAction, wrapManaRequest, WrapManaRequestAction, allowManaRequest, AllowManaRequestAction, RevokeLandRequestAction, RevokeEstateRequestAction, revokeLandRequest, revokeEstateRequest } from 'modules/wallet/actions'
import { CallHistoryMethodAction } from 'connected-react-router'

export type State = {
  value?: number | ''
}

export type DefaultProps = {}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  isAllowingMana: boolean
  isAllowingLand: boolean
  isRevokingLand: boolean
  isAllowingEstate: boolean
  isRevokingEstate: boolean
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
  onRevokeLand: typeof revokeLandRequest
  onRevokeEstate: typeof revokeEstateRequest
}

export type MapStateProps = Pick<Props,
  | 'isConnected'
  | 'isConnecting'
  | 'isEnabling'
  | 'isLoading'
  | 'isAllowingMana'
  | 'isAllowingLand'
  | 'isAllowingEstate'
  | 'isRevokingLand'
  | 'isRevokingEstate'
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
 | 'onRevokeLand'
 | 'onRevokeEstate'
 | 'onWrapMana'
 | 'onUnwrapMana'
>
export type MapDispatch = Dispatch<
 | ConnectWalletRequestAction
 | CallHistoryMethodAction
 | AllowEstateRequestAction
 | AllowLandRequestAction
 | AllowManaRequestAction
 | RevokeLandRequestAction
 | RevokeEstateRequestAction
 | WrapManaRequestAction
>
