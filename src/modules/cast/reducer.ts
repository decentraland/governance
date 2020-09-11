import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_CASTS_FAILURE,
  LOAD_CASTS_REQUEST,
  LOAD_CASTS_SUCCESS,
  LoadCastsFailureAction,
  LoadCastsRequestAction,
  LoadCastsSuccessAction,
  CREATE_CAST_FAILURE,
  CREATE_CAST_REQUEST,
  CREATE_CAST_SUCCESS,
  CreateCastFailureAction,
  CreateCastRequestAction,
  CreateCastSuccessAction
} from './actions'
import { Cast } from '@aragon/connect-voting'

export type CastState = {
  data: Record<string, Cast[]>,
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: CastState = {
  data: {},
  loading: [],
  error: {}
}

export type CastReducerAction =
  | LoadCastsFailureAction
  | LoadCastsRequestAction
  | LoadCastsSuccessAction
  | CreateCastFailureAction
  | CreateCastRequestAction
  | CreateCastSuccessAction

export const castsReducer = (state = INITIAL_STATE, action: CastReducerAction): CastState => {
  switch (action.type) {
    case LOAD_CASTS_REQUEST: {
      return {
        ...state,
        loading: [
          ...state.loading,
          ...action.payload.votes.map((vote) => ({ ...action, vote }))
        ]
      }
    }
    case LOAD_CASTS_SUCCESS: {
      const loaded = new Set(Object.keys(action.payload))
      const data = {
        ...state.data,
        ...action.payload
      }

      const error = Object.fromEntries(Object.entries(state.error)
        .filter(([key]) => !loaded.has(key)))

      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error,
        data
      }
    }
    case CREATE_CAST_SUCCESS:
    case CREATE_CAST_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case CREATE_CAST_FAILURE:
    case LOAD_CASTS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
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
