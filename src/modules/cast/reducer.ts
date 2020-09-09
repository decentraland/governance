import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_CASTS_FAILURE,
  LOAD_CASTS_REQUEST,
  LOAD_CASTS_SUCCESS,
  LoadCastsFailureAction,
  LoadCastsRequestAction,
  LoadCastsSuccessAction
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

export const castsReducer = (state = INITIAL_STATE, action: CastReducerAction): CastState => {
  switch (action.type) {
    case LOAD_CASTS_REQUEST: {
      return {
        ...state,
        loading: [
          ...state.loading,
          ...action.payload.votes.map(() => action)
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
