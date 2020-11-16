import { buildTransactionPayload } from 'decentraland-dapps/dist/modules/transaction/utils'
import { action } from 'typesafe-actions'
import { Proposal } from './types'

export const LOAD_PROPOSALS_REQUEST = '[Request] Load proposals'
export const LOAD_PROPOSALS_SUCCESS = '[Success] Load proposals'
export const LOAD_PROPOSALS_FAILURE = '[Failure] Load proposals'

export const loadProposalsRequest = () => action(LOAD_PROPOSALS_REQUEST, {})
export const loadProposalsSuccess = (votes: Record<string, Proposal>) => action(LOAD_PROPOSALS_SUCCESS, { votes })
export const loadProposalsFailure = (error: string) => action(LOAD_PROPOSALS_FAILURE, { error })

export type LoadProposalsRequestAction = ReturnType<typeof loadProposalsRequest>
export type LoadProposalsSuccessAction = ReturnType<typeof loadProposalsSuccess>
export type LoadProposalsFailureAction = ReturnType<typeof loadProposalsFailure>

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

export const EXECUTE_VOTE_REQUEST = '[Request] Execute vote'
export const EXECUTE_VOTE_SUCCESS = '[Success] Execute vote'
export const EXECUTE_VOTE_FAILURE = '[Failure] Execute vote'

export const executeVoteRequest = (voteId: string) => action(EXECUTE_VOTE_REQUEST, { voteId })
export const executeVoteSuccess = (voteId: string, hash: string) => action(EXECUTE_VOTE_SUCCESS, buildTransactionPayload(hash, { voteId }))
export const executeVoteFailure = (error: string) => action(EXECUTE_VOTE_FAILURE, { error })

export type ExecuteVoteRequestAction = ReturnType<typeof executeVoteRequest>
export type ExecuteVoteSuccessAction = ReturnType<typeof executeVoteSuccess>
export type ExecuteVoteFailureAction = ReturnType<typeof executeVoteFailure>

export const EXECUTE_SCRIPT_REQUEST = '[Request] Execute script'
export const EXECUTE_SCRIPT_SUCCESS = '[Success] Execute script'
export const EXECUTE_SCRIPT_FAILURE = '[Failure] Execute script'

export const executeScriptRequest = (scriptId: string) => action(EXECUTE_SCRIPT_REQUEST, { scriptId })
export const executeScriptSuccess = (scriptId: string, hash: string) => action(EXECUTE_SCRIPT_SUCCESS, buildTransactionPayload(hash, { scriptId }))
export const executeScriptFailure = (error: string) => action(EXECUTE_SCRIPT_FAILURE, { error })

export type ExecuteScriptRequestAction = ReturnType<typeof executeScriptRequest>
export type ExecuteScriptSuccessAction = ReturnType<typeof executeScriptSuccess>
export type ExecuteScriptFailureAction = ReturnType<typeof executeScriptFailure>
