import { action } from 'typesafe-actions'
import { App } from '@aragon/connect'

export const LOAD_APPS_REQUEST = '[Request] Load apps'
export const LOAD_APPS_SUCCESS = '[Success] Load apps'
export const LOAD_APPS_FAILURE = '[Failure] Load apps'

export const loadAppsRequest = () => action(LOAD_APPS_REQUEST, {})
export const loadAppsSuccess = (apps: Record<string, App>) => action(LOAD_APPS_SUCCESS, { apps })
export const loadAppsFailure = (error: string) => action(LOAD_APPS_FAILURE, { error })

export type LoadAppsRequestAction = ReturnType<typeof loadAppsRequest>
export type LoadAppsSuccessAction = ReturnType<typeof loadAppsSuccess>
export type LoadAppsFailureAction = ReturnType<typeof loadAppsFailure>
