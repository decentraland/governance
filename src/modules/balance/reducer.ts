import {
  LOAD_BALANCE_FAILURE,
  LOAD_BALANCE_REQUEST,
  LOAD_BALANCE_SUCCESS,
  LoadBalanceFailureAction,
  LoadBalanceRequestAction,
  LoadBalanceSuccessAction
} from './actions'
import { Balance } from './type'

export type BalanceState = {
  data: Record<string, Balance>,
  loading: Record<string, boolean>
  error: Record<string, string>
}

const INITIAL_STATE: BalanceState = {
  data: {},
  loading: {},
  error: {}
}

export type BalanceReducerAction =
  | LoadBalanceFailureAction
  | LoadBalanceRequestAction
  | LoadBalanceSuccessAction

export const balanceReducer = (state = INITIAL_STATE, action: BalanceReducerAction): BalanceState => {
  switch (action.type) {
    case LOAD_BALANCE_REQUEST: {
      const loading = Object.fromEntries(action.payload.votes.map(voteId => [voteId, true]))
      return {
        ...state,
        loading: {
          ...state.loading,
          ...loading
        }
      }
    }
    case LOAD_BALANCE_SUCCESS: {
      const ids = new Set(Object.keys(action.payload))
      const loading = Object.fromEntries(Object.entries(state.loading).filter(([key]) => !ids.has(key)))
      const error = Object.fromEntries(Object.entries(state.error).filter(([key]) => !ids.has(key)))

      return {
        ...state,
        loading,
        error,
        data: {
          ...state.data,
          ...action.payload
        }
      }
    }

    case LOAD_BALANCE_FAILURE: {
      const ids = new Set(Object.keys(action.payload))
      const loading = Object.fromEntries(Object.entries(state.loading).filter(([key]) => !ids.has(key)))
      return {
        ...state,
        loading,
        error: {
          ...state.error,
          ...action.payload
        }
      }
    }
    default:
      return state
  }
}
