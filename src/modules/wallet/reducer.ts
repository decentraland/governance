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
  ALLOW_MANA_FAILURE,
  ALLOW_MANA_REQUEST,
  ALLOW_MANA_SUCCESS,
  AllowManaFailureAction,
  AllowManaRequestAction,
  AllowManaSuccessAction,
  AllowLandFailureAction,
  AllowLandRequestAction,
  AllowLandSuccessAction,
  AllowEstateFailureAction,
  AllowEstateRequestAction,
  AllowEstateSuccessAction,
  ALLOW_ESTATE_SUCCESS,
  ALLOW_LAND_SUCCESS,
  ALLOW_ESTATE_FAILURE,
  ALLOW_LAND_FAILURE,
  ALLOW_ESTATE_REQUEST,
  ALLOW_LAND_REQUEST,
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
  | AllowLandFailureAction
  | AllowLandRequestAction
  | AllowLandSuccessAction
  | AllowEstateFailureAction
  | AllowEstateRequestAction
  | AllowEstateSuccessAction
  | BaseWalletReducerAction
  | WrapManaRequestAction
  | WrapManaSuccessAction
  | WrapManaFailureAction
  | UnwrapManaRequestAction
  | UnwrapManaSuccessAction
  | UnwrapManaFailureAction
  | AllowManaFailureAction
  | AllowManaRequestAction
  | AllowManaSuccessAction

export const walletReducer = (state = INITIAL_STATE, action: WalletReducerAction): WalletState => {
  switch (action.type) {
    case ALLOW_MANA_REQUEST:
    case ALLOW_LAND_REQUEST:
    case ALLOW_ESTATE_REQUEST:
    case WRAP_MANA_REQUEST:
    case UNWRAP_MANA_REQUEST:
    case LOAD_BALANCE_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case WRAP_MANA_SUCCESS:
    case UNWRAP_MANA_SUCCESS:
    case ALLOW_MANA_FAILURE:
    case ALLOW_LAND_FAILURE:
    case ALLOW_ESTATE_FAILURE: {
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

    case ALLOW_MANA_SUCCESS:
    case ALLOW_LAND_SUCCESS:
    case ALLOW_ESTATE_SUCCESS:
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
