import { LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import {
  UNSUBSCRIBE_SUCCESS,
  UNSUBSCRIBE_FAILURE,
  SUBSCRIBE_VOTE_FAILURE,
  SUBSCRIBE_VOTE_SUCCESS,
  SUBSCRIBE_VOTING_FAILURE,
  SUBSCRIBE_VOTING_SUCCESS,
  SUBSCRIBE_DELAYING_FAILURE,
  SUBSCRIBE_DELAYING_SUCCESS,
  SubscribeVoteFailureAction,
  SubscribeVoteSuccessAction,
  SubscribeVotingFailureAction,
  SubscribeVotingSuccessAction,
  SubscribeDelayingFailureAction,
  SubscribeDelayingSuccessAction,
  UnsubscribeFailureAction,
  UnsubscribeSuccessAction
} from './actions'
import { Subscription } from './types'

export type SubscriptionState = {
  data: Record<string, Subscription>,
  loading: LoadingState
  error: Record<string, string>
}

const INITIAL_STATE: SubscriptionState = {
  data: {},
  loading: [],
  error: {}
}

export type SubscribeReducerAction =
  | SubscribeVoteFailureAction
  | SubscribeVoteSuccessAction
  | SubscribeVotingFailureAction
  | SubscribeVotingSuccessAction
  | UnsubscribeFailureAction
  | UnsubscribeSuccessAction
  | SubscribeDelayingFailureAction
  | SubscribeDelayingSuccessAction

export const subscriptionReducer = (state = INITIAL_STATE, action: SubscribeReducerAction): SubscriptionState => {
  switch (action.type) {
    case UNSUBSCRIBE_SUCCESS: {
      const removedSubscription = new Set(action.payload.subscriptions)
      const data = Object.fromEntries(Object.entries(state.data).filter(([key]) => !removedSubscription.has(key)))
      return {
        ...state,
        data
      }
    }

    case SUBSCRIBE_DELAYING_SUCCESS:
    case SUBSCRIBE_VOTING_SUCCESS:
    case SUBSCRIBE_VOTE_SUCCESS: {
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload
        }
      }
    }

    case UNSUBSCRIBE_FAILURE:
    case SUBSCRIBE_DELAYING_FAILURE:
    case SUBSCRIBE_VOTING_FAILURE:
    case SUBSCRIBE_VOTE_FAILURE: {
      return {
        ...state,
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
