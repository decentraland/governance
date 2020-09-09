import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  LOAD_VOTES_FAILURE,
  LOAD_VOTES_REQUEST,
  LOAD_VOTES_SUCCESS,
  LoadVotesSuccessAction,
  LoadVotesFailureAction,
  LoadVotesRequestAction,
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
  CreateQuestionSuccessAction
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

export const voteReducer = (state = INITIAL_STATE, action: VoteReducerAction): VoteState => {
  switch (action.type) {
    case CREATE_BAN_REQUEST:
    case CREATE_QUESTION_REQUEST:
    case CREATE_CATALYST_REQUEST:
    case CREATE_POI_REQUEST:
    case LOAD_VOTES_REQUEST: {
      const newErrors = Object.entries(state.error).filter(([key]) => key !== action.type)
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: Object.fromEntries(newErrors)
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

    case CREATE_BAN_SUCCESS:
    case CREATE_QUESTION_SUCCESS:
    case CREATE_CATALYST_SUCCESS:
    case CREATE_POI_SUCCESS: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action)
      }
    }

    case CREATE_BAN_FAILURE:
    case CREATE_QUESTION_FAILURE:
    case CREATE_CATALYST_FAILURE:
    case CREATE_POI_FAILURE:
    case LOAD_VOTES_FAILURE: {
      return {
        ...state,
        loading: loadingReducer(state.loading, action),
        error: {
          ...state.error,
          [LOAD_VOTES_REQUEST]: action.payload.error
        }
      }
    }
    default:
      return state
  }
}
