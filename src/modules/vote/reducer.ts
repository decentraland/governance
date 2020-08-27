import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_VOTES_FAILURE,
  LOAD_VOTES_REQUEST,
  LOAD_VOTES_SUCCESS,
  LoadVotesSuccessAction,
  LoadVotesFailureAction,
  LoadVotesRequestAction
} from './actions'
import { Vote } from './types'

export type VoteState = {
  data: Record<string, Vote>,
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: VoteState = {
  data: {},
  loading: [],
  error: {}
}

export type VoteReducerAction =
  | LoadVotesSuccessAction
  | LoadVotesFailureAction
  | LoadVotesRequestAction

export const voteReducer = (state = INITIAL_STATE, action: VoteReducerAction): VoteState => {
  switch (action.type) {
    case LOAD_VOTES_REQUEST: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_VOTES_SUCCESS: {
      const { votes } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          ...votes
        },
        loading: loadingReducer(state.loading, action)
      }
    }
    case LOAD_VOTES_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }
    default:
      return state
  }
}
