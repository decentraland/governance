import { action } from 'typesafe-actions'
import { Cast } from '@aragon/connect-voting'
import { ChainId } from '@dcl/schemas';
import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'

export const LOAD_CASTS_REQUEST = '[Request] Load cast'
export const LOAD_CASTS_SUCCESS = '[Success] Load cast'
export const LOAD_CASTS_FAILURE = '[Failure] Load cast'

export const loadCastsRequest = (votes: string[]) => action(LOAD_CASTS_REQUEST, { votes })
export const loadCastsSuccess = (casts: Record<string, Cast[]>) => action(LOAD_CASTS_SUCCESS, casts)
export const loadCastsFailure = (error: Record<string, string>) => action(LOAD_CASTS_FAILURE, error)

export type LoadCastsRequestAction = ReturnType<typeof loadCastsRequest>
export type LoadCastsSuccessAction = ReturnType<typeof loadCastsSuccess>
export type LoadCastsFailureAction = ReturnType<typeof loadCastsFailure>

export const CREATE_CAST_REQUEST = '[Request] Create cast'
export const CREATE_CAST_SUCCESS = '[Success] Create cast'
export const CREATE_CAST_FAILURE = '[Failure] Create cast'

export const createCastRequest = (voteId: string, support: boolean) => action(CREATE_CAST_REQUEST, { voteId, support })
export const createCastSuccess = (voteId: string, chainId: ChainId, hash: string) => action(CREATE_CAST_SUCCESS, buildTransactionPayload(chainId, hash, { voteId }))
export const createCastFailure = (error: Record<string, string>) => action(CREATE_CAST_FAILURE, error)

export type CreateCastRequestAction = ReturnType<typeof createCastRequest>
export type CreateCastSuccessAction = ReturnType<typeof createCastSuccess>
export type CreateCastFailureAction = ReturnType<typeof createCastFailure>
