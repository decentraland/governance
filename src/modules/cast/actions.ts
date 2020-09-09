import { action } from 'typesafe-actions'
import { Cast } from '@aragon/connect-voting'

export const LOAD_CASTS_REQUEST = '[Request] Load cast'
export const LOAD_CASTS_SUCCESS = '[Success] Load cast'
export const LOAD_CASTS_FAILURE = '[Failure] Load cast'

export const loadCastsRequest = (votes: string[]) => action(LOAD_CASTS_REQUEST, { votes })
export const loadCastsSuccess = (casts: Record<string, Cast[]>) => action(LOAD_CASTS_SUCCESS, casts)
export const loadCastsFailure = (error: Record<string, string>) => action(LOAD_CASTS_FAILURE, error)

export type LoadCastsRequestAction = ReturnType<typeof loadCastsRequest>
export type LoadCastsSuccessAction = ReturnType<typeof loadCastsSuccess>
export type LoadCastsFailureAction = ReturnType<typeof loadCastsFailure>
