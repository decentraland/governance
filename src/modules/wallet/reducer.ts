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
  REGISTER_LAND_BALANCE_REQUEST
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

export const walletReducer = (state = INITIAL_STATE, action: WalletReducerAction): WalletState => {
  switch (action.type) {
    case REGISTER_LAND_BALANCE_REQUEST:
    case REGISTER_ESTATE_BALANCE_REQUEST:
    case LOAD_BALANCE_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case REGISTER_LAND_BALANCE_FAILURE:
    case REGISTER_ESTATE_BALANCE_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case LOAD_BALANCE_FAILURE: {
      return {
        data: null,
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
