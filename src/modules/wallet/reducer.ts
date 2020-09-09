import { Wallet } from './types'
import {
  walletReducer as baseWalletReducer,
  WalletReducerAction as BaseWalletReducerAction
} from 'decentraland-dapps/dist/modules/wallet/reducer'
import {
  LOAD_BALANCE_FAILURE,
  LOAD_BALANCE_REQUEST,
  LOAD_BALANCE_SUCCESS,
  LoadBalanceFailureAction,
  LoadBalanceRequestAction,
  LoadBalanceSuccessAction,
  RegisterLandBalanceFailureAction,
  RegisterLandBalanceRequestAction,
  RegisterLandBalanceSuccessAction,
  RegisterEstateBalanceFailureAction,
  RegisterEstateBalanceRequestAction,
  RegisterEstateBalanceSuccessAction,
  REGISTER_ESTATE_BALANCE_SUCCESS,
  REGISTER_LAND_BALANCE_SUCCESS,
  REGISTER_ESTATE_BALANCE_FAILURE,
  REGISTER_LAND_BALANCE_FAILURE,
  REGISTER_ESTATE_BALANCE_REQUEST,
  REGISTER_LAND_BALANCE_REQUEST,
  WRAP_MANA_FAILURE,
  WRAP_MANA_REQUEST,
  WRAP_MANA_SUCCESS,
  WrapManaFailureAction,
  WrapManaRequestAction,
  WrapManaSuccessAction,
  UNWRAP_MANA_FAILURE,
  UNWRAP_MANA_REQUEST,
  UNWRAP_MANA_SUCCESS,
  UnwrapManaFailureAction,
  UnwrapManaRequestAction,
  UnwrapManaSuccessAction
} from './actions'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'

export type WalletState = {
  data: Wallet | null
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: WalletState = {
  data: null,
  loading: [],
  error: null
}

export type WalletReducerAction =
  | LoadBalanceFailureAction
  | LoadBalanceRequestAction
  | LoadBalanceSuccessAction
  | RegisterLandBalanceFailureAction
  | RegisterLandBalanceRequestAction
  | RegisterLandBalanceSuccessAction
  | RegisterEstateBalanceFailureAction
  | RegisterEstateBalanceRequestAction
  | RegisterEstateBalanceSuccessAction
  | BaseWalletReducerAction
  | WrapManaRequestAction
  | WrapManaSuccessAction
  | WrapManaFailureAction
  | UnwrapManaRequestAction
  | UnwrapManaSuccessAction
  | UnwrapManaFailureAction

export const walletReducer = (state = INITIAL_STATE, action: WalletReducerAction): WalletState => {
  switch (action.type) {
    case WRAP_MANA_REQUEST:
    case UNWRAP_MANA_REQUEST:
    case REGISTER_LAND_BALANCE_REQUEST:
    case REGISTER_ESTATE_BALANCE_REQUEST:
    case LOAD_BALANCE_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case WRAP_MANA_SUCCESS:
    case UNWRAP_MANA_SUCCESS:
    case REGISTER_LAND_BALANCE_FAILURE:
    case REGISTER_ESTATE_BALANCE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case WRAP_MANA_FAILURE:
    case UNWRAP_MANA_FAILURE:
    case LOAD_BALANCE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }

    case REGISTER_LAND_BALANCE_SUCCESS:
    case REGISTER_ESTATE_BALANCE_SUCCESS:
    case LOAD_BALANCE_SUCCESS: {
      return {
        data: {
          ...state.data!,
          ...action.payload
        },
        loading: loadingReducer(state.loading, action),
        error: null
      }
    }
    default:
      return baseWalletReducer(state, action)
  }
}
