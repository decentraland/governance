import { action } from 'typesafe-actions'
import { Vote, Voting } from '@aragon/connect-voting'
import { Subscription } from './types'

export const UNSUBSCRIBE_REQUEST = '[Request] Unsubscribe'
export const UNSUBSCRIBE_SUCCESS = '[Success] Unsubscribe'
export const UNSUBSCRIBE_FAILURE = '[Failure] Unsubscribe'

export const unsubscribeRequest = (subscriptions: string[]) => action(UNSUBSCRIBE_REQUEST, { subscriptions })
export const unsubscribeSuccess = (subscriptions: string[]) => action(UNSUBSCRIBE_SUCCESS, { subscriptions })
export const unsubscribeFailure = (error: Record<string, string>) => action(UNSUBSCRIBE_FAILURE, error)

export type UnsubscribeRequestAction = ReturnType<typeof unsubscribeRequest>
export type UnsubscribeSuccessAction = ReturnType<typeof unsubscribeSuccess>
export type UnsubscribeFailureAction = ReturnType<typeof unsubscribeFailure>

export const SUBSCRIBE_VOTING_REQUEST = '[Request] Subscribe voting'
export const SUBSCRIBE_VOTING_SUCCESS = '[Success] Subscribe voting'
export const SUBSCRIBE_VOTING_FAILURE = '[Failure] Subscribe voting'

export const subscribeVotingRequest = (voting: Record<string, Voting>) => action(SUBSCRIBE_VOTING_REQUEST, voting)
export const subscribeVotingSuccess = (subscriptions: Record<string, Subscription>) => action(SUBSCRIBE_VOTING_SUCCESS, subscriptions)
export const subscribeVotingFailure = (error: Record<string, string>) => action(SUBSCRIBE_VOTING_FAILURE, error)

export type SubscribeVotingRequestAction = ReturnType<typeof subscribeVotingRequest>
export type SubscribeVotingSuccessAction = ReturnType<typeof subscribeVotingSuccess>
export type SubscribeVotingFailureAction = ReturnType<typeof subscribeVotingFailure>

export const SUBSCRIBE_VOTE_REQUEST = '[Request] Subscribe vote'
export const SUBSCRIBE_VOTE_SUCCESS = '[Success] Subscribe vote'
export const SUBSCRIBE_VOTE_FAILURE = '[Failure] Subscribe vote'

export const subscribeVoteRequest = (votes: Record<string, Vote>) => action(SUBSCRIBE_VOTE_REQUEST, votes)
export const subscribeVoteSuccess = (subscriptions: Record<string, Subscription>) => action(SUBSCRIBE_VOTE_SUCCESS, subscriptions)
export const subscribeVoteFailure = (error: Record<string, string>) => action(SUBSCRIBE_VOTE_FAILURE, error)

export type SubscribeVoteRequestAction = ReturnType<typeof subscribeVoteRequest>
export type SubscribeVoteSuccessAction = ReturnType<typeof subscribeVoteSuccess>
export type SubscribeVoteFailureAction = ReturnType<typeof subscribeVoteFailure>
