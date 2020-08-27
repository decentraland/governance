import { action } from 'typesafe-actions'
import { Vote } from './types'

export const LOAD_VOTES_REQUEST = '[Request] Load votes'
export const LOAD_VOTES_SUCCESS = '[Success] Load votes'
export const LOAD_VOTES_FAILURE = '[Failure] Load votes'

export const loadVotesRequest = () => action(LOAD_VOTES_REQUEST, {})
export const loadVotesSuccess = (votes: Record<string, Vote>) => action(LOAD_VOTES_SUCCESS, { votes })
export const loadVotesFailure = (error: string) => action(LOAD_VOTES_FAILURE, { error })

export type LoadVotesRequestAction = ReturnType<typeof loadVotesRequest>
export type LoadVotesSuccessAction = ReturnType<typeof loadVotesSuccess>
export type LoadVotesFailureAction = ReturnType<typeof loadVotesFailure>
