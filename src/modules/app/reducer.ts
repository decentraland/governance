import { App } from './types'
import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_APPS_FAILURE,
  LOAD_APPS_REQUEST,
  LOAD_APPS_SUCCESS,
  LoadAppsFailureAction,
  LoadAppsRequestAction,
  LoadAppsSuccessAction
} from './actions'

export type AppState = {
  data: Record<string, App>,
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: AppState = {
  data: {},
  loading: [],
  error: {}
}

export type AppReducerAction =
  | LoadAppsFailureAction
  | LoadAppsRequestAction
  | LoadAppsSuccessAction

export const appReducer = (state = INITIAL_STATE, action: AppReducerAction): AppState => {
  switch (action.type) {
    case LOAD_APPS_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_APPS_SUCCESS: {
      const { apps } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...apps
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_APPS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    default:
      return state
  }
}
