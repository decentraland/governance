import { action } from 'typesafe-actions'
import { VoteDescription } from './types'

export const LOAD_VOTE_DESCRIPTION_REQUEST = '[Request] Load vote description'
export const LOAD_VOTE_DESCRIPTION_SUCCESS = '[Success] Load vote description'
export const LOAD_VOTE_DESCRIPTION_FAILURE = '[Failure] Load vote description'

export const loadVoteDescriptionRequest = (votes: string[]) => action(LOAD_VOTE_DESCRIPTION_REQUEST, { votes })
export const loadVoteDescriptionSuccess = (description: Record<string, VoteDescription>) => action(LOAD_VOTE_DESCRIPTION_SUCCESS, description)
export const loadVoteDescriptionFailure = (error: Record<string, string>) => action(LOAD_VOTE_DESCRIPTION_FAILURE, error)

export type LoadVoteDescriptionRequestAction = ReturnType<typeof loadVoteDescriptionRequest>
export type LoadVoteDescriptionSuccessAction = ReturnType<typeof loadVoteDescriptionSuccess>
export type LoadVoteDescriptionFailureAction = ReturnType<typeof loadVoteDescriptionFailure>
