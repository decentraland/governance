import { action } from 'typesafe-actions'
import { AggregatedVote } from './types'

export const LOAD_VOTES_REQUEST = '[Request] Load votes'
export const LOAD_VOTES_SUCCESS = '[Success] Load votes'
export const LOAD_VOTES_FAILURE = '[Failure] Load votes'

export const loadVotesRequest = () => action(LOAD_VOTES_REQUEST, {})
export const loadVotesSuccess = (votes: Record<string, AggregatedVote>) => action(LOAD_VOTES_SUCCESS, { votes })
export const loadVotesFailure = (error: string) => action(LOAD_VOTES_FAILURE, { error })

export type LoadVotesRequestAction = ReturnType<typeof loadVotesRequest>
export type LoadVotesSuccessAction = ReturnType<typeof loadVotesSuccess>
export type LoadVotesFailureAction = ReturnType<typeof loadVotesFailure>

export const CREATE_QUESTION_REQUEST = '[Request] Create question'
export const CREATE_QUESTION_SUCCESS = '[Success] Create question'
export const CREATE_QUESTION_FAILURE = '[Failure] Create question'

export const createQuestionRequest = (question: string) => action(CREATE_QUESTION_REQUEST, { question })
export const createQuestionSuccess = () => action(CREATE_QUESTION_SUCCESS, {})
export const createQuestionFailure = (error: string) => action(CREATE_QUESTION_FAILURE, { error })

export type CreateQuestionRequestAction = ReturnType<typeof createQuestionRequest>
export type CreateQuestionSuccessAction = ReturnType<typeof createQuestionSuccess>
export type CreateQuestionFailureAction = ReturnType<typeof createQuestionFailure>

export const CREATE_BAN_REQUEST = '[Request] Create ban'
export const CREATE_BAN_SUCCESS = '[Success] Create ban'
export const CREATE_BAN_FAILURE = '[Failure] Create ban'

export const createBanRequest = (name: string) => action(CREATE_BAN_REQUEST, { name })
export const createBanSuccess = () => action(CREATE_BAN_SUCCESS, {})
export const createBanFailure = (error: string) => action(CREATE_BAN_FAILURE, { error })

export type CreateBanRequestAction = ReturnType<typeof createBanRequest>
export type CreateBanSuccessAction = ReturnType<typeof createBanSuccess>
export type CreateBanFailureAction = ReturnType<typeof createBanFailure>

export const CREATE_POI_REQUEST = '[Request] Create POI'
export const CREATE_POI_SUCCESS = '[Success] Create POI'
export const CREATE_POI_FAILURE = '[Failure] Create POI'

export const createPoiRequest = (x: number, y: number) => action(CREATE_POI_REQUEST, { x, y })
export const createPoiSuccess = () => action(CREATE_POI_SUCCESS, {})
export const createPoiFailure = (error: string) => action(CREATE_POI_FAILURE, { error })

export type CreatePoiRequestAction = ReturnType<typeof createPoiRequest>
export type CreatePoiSuccessAction = ReturnType<typeof createPoiSuccess>
export type CreatePoiFailureAction = ReturnType<typeof createPoiFailure>

export const CREATE_CATALYST_REQUEST = '[Request] Create Catalyst'
export const CREATE_CATALYST_SUCCESS = '[Success] Create Catalyst'
export const CREATE_CATALYST_FAILURE = '[Failure] Create Catalyst'

export const createCatalystRequest = (owner: string, url: string) => action(CREATE_CATALYST_REQUEST, { owner, url })
export const createCatalystSuccess = () => action(CREATE_CATALYST_SUCCESS, {})
export const createCatalystFailure = (error: string) => action(CREATE_CATALYST_FAILURE, { error })

export type CreateCatalystRequestAction = ReturnType<typeof createCatalystRequest>
export type CreateCatalystSuccessAction = ReturnType<typeof createCatalystSuccess>
export type CreateCatalystFailureAction = ReturnType<typeof createCatalystFailure>
