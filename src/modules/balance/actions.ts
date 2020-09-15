import { action } from 'typesafe-actions'
import { Balance } from './type'

export const LOAD_BALANCE_REQUEST = '[Request] Load balance'
export const LOAD_BALANCE_SUCCESS = '[Success] Load balance'
export const LOAD_BALANCE_FAILURE = '[Failure] Load balance'

export const loadBalanceRequest = (votes: string[]) => action(LOAD_BALANCE_REQUEST, { votes })
export const loadBalanceSuccess = (balance: Record<string, Balance>) => action(LOAD_BALANCE_SUCCESS, balance)
export const loadBalanceFailure = (error: Record<string, string>) => action(LOAD_BALANCE_FAILURE, error)

export type LoadBalanceRequestAction = ReturnType<typeof loadBalanceRequest>
export type LoadBalanceSuccessAction = ReturnType<typeof loadBalanceSuccess>
export type LoadBalanceFailureAction = ReturnType<typeof loadBalanceFailure>
