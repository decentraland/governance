import {
  LOAD_EMBED_FAILURE,
  LOAD_EMBED_REQUEST,
  LOAD_EMBED_SUCCESS,
  LoadEmbedFailureAction,
  LoadEmbedRequestAction,
  LoadEmbedSuccessAction
} from './actions'
import { Embed } from './types'

export type ProposalEmbedState = {
  data: Record<string, Embed[]>,
  loading: Record<string, boolean>
  error: Record<string, string>
}

const INITIAL_STATE: ProposalEmbedState = {
  data: {},
  loading: {},
  error: {}
}

export type ProposalEmbedReducerAction =
  | LoadEmbedFailureAction
  | LoadEmbedRequestAction
  | LoadEmbedSuccessAction

export const proposalEmbedReducer = (state = INITIAL_STATE, action: ProposalEmbedReducerAction): ProposalEmbedState => {
  switch (action.type) {
    case LOAD_EMBED_REQUEST: {
      const loading = Object.fromEntries(action.payload.proposals.map(proposalId => [proposalId, true]))
      return {
        ...state,
        loading: {
          ...state.loading,
          ...loading
        }
      }
    }
    case LOAD_EMBED_SUCCESS: {
      const ids = new Set(Object.keys(action.payload))
      console.log(ids, Object.entries(state.loading))
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
    case LOAD_EMBED_FAILURE: {
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
