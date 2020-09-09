import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_VOTE_DESCRIPTION_FAILURE,
  LOAD_VOTE_DESCRIPTION_REQUEST,
  LOAD_VOTE_DESCRIPTION_SUCCESS,
  LoadVoteDescriptionFailureAction,
  LoadVoteDescriptionRequestAction,
  LoadVoteDescriptionSuccessAction
} from './actions'
import { VoteDescription } from './types'

export type VoteDescriptionState = {
  data: Record<string, VoteDescription>,
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: VoteDescriptionState = {
  data: {},
  loading: [],
  error: {}
}

export type VoteDescriptionReducerAction =
  | LoadVoteDescriptionFailureAction
  | LoadVoteDescriptionRequestAction
  | LoadVoteDescriptionSuccessAction

export const voteDescriptionReducer = (state = INITIAL_STATE, action: VoteDescriptionReducerAction): VoteDescriptionState => {
  switch (action.type) {
    case LOAD_VOTE_DESCRIPTION_REQUEST: {
      return {
        ...state,
        loading: [
          ...state.loading,
          ...action.payload.votes.map((vote) => ({ ...action, vote }))
        ]
      }
    }
    case LOAD_VOTE_DESCRIPTION_SUCCESS: {
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
    case LOAD_VOTE_DESCRIPTION_FAILURE: {
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
