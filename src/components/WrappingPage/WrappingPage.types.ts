import { Dispatch } from 'redux'
import { connectWalletRequest, ConnectWalletRequestAction } from 'decentraland-dapps/dist/modules/wallet/actions'
import { Wallet } from 'modules/wallet/types'
import { registerLandBalanceRequest, registerEstateBalanceRequest, RegisterLandBalanceRequestAction, RegisterEstateBalanceRequestAction, wrapManaRequest, WrapManaRequestAction } from 'modules/wallet/actions'

export type DefaultProps = {}

export type Props = DefaultProps & {
  isConnected: boolean
  isConnecting: boolean
  isEnabling: boolean
  isLoading: boolean
  isRegisteringLand: boolean
  isRegisteringEstate: boolean
  isWrappingMana: boolean
  isUnwrappingMana: boolean
  wallet: Wallet | null | undefined
  onConnect: typeof connectWalletRequest
  onWrapToken: typeof wrapManaRequest
  onUnwrapToken: typeof wrapManaRequest
  onRegisterLand: typeof registerLandBalanceRequest
  onRegisterEstate: typeof registerEstateBalanceRequest
}

export type MapStateProps = Pick<Props, 'isConnected' | 'isConnecting' | 'isEnabling' | 'isLoading' | 'isRegisteringLand' | 'isRegisteringEstate' | 'isWrappingMana' | 'isUnwrappingMana' | 'wallet'>
export type MapDispatchProps = Pick<Props, 'onConnect' | 'onRegisterLand' | 'onRegisterEstate' | 'onWrapToken' | 'onUnwrapToken'>
export type MapDispatch = Dispatch<ConnectWalletRequestAction | RegisterEstateBalanceRequestAction | RegisterLandBalanceRequestAction | WrapManaRequestAction>
