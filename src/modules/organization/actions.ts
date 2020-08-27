import { action } from 'typesafe-actions'
import { Organization } from './types'

export const LOAD_ORGANIZATION_REQUEST = '[Request] Load organization'
export const LOAD_ORGANIZATION_SUCCESS = '[Success] Load organization'
export const LOAD_ORGANIZATION_FAILURE = '[Failure] Load organization'

export const loadOrganizationRequest = () => action(LOAD_ORGANIZATION_REQUEST, {})
export const loadOrganizationSuccess = (organization: Organization) => action(LOAD_ORGANIZATION_SUCCESS, { organization })
export const loadOrganizationFailure = (error: string) => action(LOAD_ORGANIZATION_FAILURE, { error })

export type LoadOrganizationRequestAction = ReturnType<typeof loadOrganizationRequest>
export type LoadOrganizationSuccessAction = ReturnType<typeof loadOrganizationSuccess>
export type LoadOrganizationFailureAction = ReturnType<typeof loadOrganizationFailure>
