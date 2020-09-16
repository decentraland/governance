import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_PROPOSAL_DESCRIPTION_FAILURE,
  LOAD_PROPOSAL_DESCRIPTION_REQUEST,
  LOAD_PROPOSAL_DESCRIPTION_SUCCESS,
  LoadProposalDescriptionFailureAction,
  LoadProposalDescriptionRequestAction,
  LoadProposalDescriptionSuccessAction
} from './actions'
import { ProposalDescription } from './types'

export type ProposalDescriptionState = {
  data: Record<string, ProposalDescription>,
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: ProposalDescriptionState = {
  data: {},
  loading: [],
  error: {}
}

export type ProposalDescriptionReducerAction =
  | LoadProposalDescriptionFailureAction
  | LoadProposalDescriptionRequestAction
  | LoadProposalDescriptionSuccessAction

export const proposalDescriptionReducer = (state = INITIAL_STATE, action: ProposalDescriptionReducerAction): ProposalDescriptionState => {
  switch (action.type) {
    case LOAD_PROPOSAL_DESCRIPTION_REQUEST: {
      return {
        ...state,
        loading: [
          ...state.loading,
          ...action.payload.votes.map((vote) => ({ ...action, vote }))
        ]
      }
    }
    case LOAD_PROPOSAL_DESCRIPTION_SUCCESS: {
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
    case LOAD_PROPOSAL_DESCRIPTION_FAILURE: {
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
