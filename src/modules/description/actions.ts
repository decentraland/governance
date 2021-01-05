import { action } from 'typesafe-actions'
import { ProposalDescription } from './types'

export const LOAD_PROPOSAL_DESCRIPTION_REQUEST = '[Request] Load proposal description'
export const LOAD_PROPOSAL_DESCRIPTION_SUCCESS = '[Success] Load proposal description'
export const LOAD_PROPOSAL_DESCRIPTION_FAILURE = '[Failure] Load proposal description'

export const loadProposalDescriptionRequest = (proposals: string[]) => action(LOAD_PROPOSAL_DESCRIPTION_REQUEST, { proposals })
export const loadProposalDescriptionSuccess = (description: Record<string, ProposalDescription>) => action(LOAD_PROPOSAL_DESCRIPTION_SUCCESS, description)
export const loadProposalDescriptionFailure = (error: Record<string, string>) => action(LOAD_PROPOSAL_DESCRIPTION_FAILURE, error)

export type LoadProposalDescriptionRequestAction = ReturnType<typeof loadProposalDescriptionRequest>
export type LoadProposalDescriptionSuccessAction = ReturnType<typeof loadProposalDescriptionSuccess>
export type LoadProposalDescriptionFailureAction = ReturnType<typeof loadProposalDescriptionFailure>
