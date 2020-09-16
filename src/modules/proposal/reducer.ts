import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_PROPOSALS_FAILURE,
  LOAD_PROPOSALS_REQUEST,
  LOAD_PROPOSALS_SUCCESS,
  LoadProposalsSuccessAction,
  LoadProposalsFailureAction,
  LoadProposalsRequestAction,
  CREATE_BAN_FAILURE,
  CREATE_BAN_REQUEST,
  CREATE_BAN_SUCCESS,
  CREATE_CATALYST_FAILURE,
  CREATE_CATALYST_REQUEST,
  CREATE_CATALYST_SUCCESS,
  CREATE_POI_FAILURE,
  CREATE_POI_REQUEST,
  CREATE_POI_SUCCESS,
  CREATE_QUESTION_FAILURE,
  CREATE_QUESTION_REQUEST,
  CREATE_QUESTION_SUCCESS,
  CreateBanFailureAction,
  CreateBanRequestAction,
  CreateBanSuccessAction,
  CreateCatalystFailureAction,
  CreateCatalystRequestAction,
  CreateCatalystSuccessAction,
  CreatePoiFailureAction,
  CreatePoiRequestAction,
  CreatePoiSuccessAction,
  CreateQuestionFailureAction,
  CreateQuestionRequestAction,
  CreateQuestionSuccessAction,
  EXECUTE_SCRIPT_FAILURE,
  EXECUTE_SCRIPT_REQUEST,
  EXECUTE_SCRIPT_SUCCESS,
  ExecuteScriptFailureAction,
  ExecuteScriptRequestAction,
  ExecuteScriptSuccessAction
} from './actions'
import { Proposal } from './types'

export type ProposalState = {
  data: Record<string, Proposal>,
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: ProposalState = {
  data: {},
  loading: [],
  error: {}
}

export type ProposalReducerAction =
  | LoadProposalsSuccessAction
  | LoadProposalsFailureAction
  | LoadProposalsRequestAction
  | CreateBanFailureAction
  | CreateBanRequestAction
  | CreateBanSuccessAction
  | CreateCatalystFailureAction
  | CreateCatalystRequestAction
  | CreateCatalystSuccessAction
  | CreatePoiFailureAction
  | CreatePoiRequestAction
  | CreatePoiSuccessAction
  | CreateQuestionFailureAction
  | CreateQuestionRequestAction
  | CreateQuestionSuccessAction
  | ExecuteScriptFailureAction
  | ExecuteScriptRequestAction
  | ExecuteScriptSuccessAction

export const proposalReducer = (state = INITIAL_STATE, action: ProposalReducerAction): ProposalState => {
  switch (action.type) {
    case CREATE_BAN_REQUEST:
    case EXECUTE_SCRIPT_REQUEST:
    case CREATE_QUESTION_REQUEST:
    case CREATE_CATALYST_REQUEST:
    case CREATE_POI_REQUEST:
    case LOAD_PROPOSALS_REQUEST: {
      const newErrors = Object.entries(state.error).filter(([key]) => key !== action.type)
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: Object.fromEntries(newErrors)
      }
    }
    case LOAD_PROPOSALS_SUCCESS: {
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

    case EXECUTE_SCRIPT_SUCCESS:
    case CREATE_BAN_SUCCESS:
    case CREATE_QUESTION_SUCCESS:
    case CREATE_CATALYST_SUCCESS:
    case CREATE_POI_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case EXECUTE_SCRIPT_FAILURE:
    case CREATE_QUESTION_FAILURE:
    case CREATE_CATALYST_FAILURE:
    case CREATE_POI_FAILURE:
    case CREATE_BAN_FAILURE:
    case LOAD_PROPOSALS_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: {
          ...state.error,
          [action.type]: action.payload.error
        }
      }
    }
    default:
      return state
  }
}
