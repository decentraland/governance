import { action } from 'typesafe-actions'
import { Wallet } from './types'

export const LOAD_BALANCE_REQUEST = '[Request] Load balance'
export const LOAD_BALANCE_SUCCESS = '[Success] Load balance'
export const LOAD_BALANCE_FAILURE = '[Failure] Load balance'

export const loadBalanceRequest = () => action(LOAD_BALANCE_REQUEST, {})
export const loadBalanceSuccess = (wallet: Wallet | null) => action(LOAD_BALANCE_SUCCESS, wallet)
export const loadBalanceFailure = (error: string) => action(LOAD_BALANCE_FAILURE, { error })

export type LoadBalanceRequestAction = ReturnType<typeof loadBalanceRequest>
export type LoadBalanceSuccessAction = ReturnType<typeof loadBalanceSuccess>
export type LoadBalanceFailureAction = ReturnType<typeof loadBalanceFailure>

export const REGISTER_LAND_BALANCE_REQUEST = '[Request] Register land balance'
export const REGISTER_LAND_BALANCE_SUCCESS = '[Success] Register land balance'
export const REGISTER_LAND_BALANCE_FAILURE = '[Failure] Register land balance'

export const registerLandBalanceRequest = () => action(REGISTER_LAND_BALANCE_REQUEST, {})
export const registerLandBalanceSuccess = () => action(REGISTER_LAND_BALANCE_SUCCESS, {})
export const registerLandBalanceFailure = (error: string) => action(REGISTER_LAND_BALANCE_FAILURE, { error })

export type RegisterLandBalanceRequestAction = ReturnType<typeof registerLandBalanceRequest>
export type RegisterLandBalanceSuccessAction = ReturnType<typeof registerLandBalanceSuccess>
export type RegisterLandBalanceFailureAction = ReturnType<typeof registerLandBalanceFailure>

export const REGISTER_ESTATE_BALANCE_REQUEST = '[Request] Register estate balance'
export const REGISTER_ESTATE_BALANCE_SUCCESS = '[Success] Register estate balance'
export const REGISTER_ESTATE_BALANCE_FAILURE = '[Failure] Register estate balance'

export const registerEstateBalanceRequest = () => action(REGISTER_ESTATE_BALANCE_REQUEST, {})
export const registerEstateBalanceSuccess = () => action(REGISTER_ESTATE_BALANCE_SUCCESS, {})
export const registerEstateBalanceFailure = (error: string) => action(REGISTER_ESTATE_BALANCE_FAILURE, { error })

export type RegisterEstateBalanceRequestAction = ReturnType<typeof registerEstateBalanceRequest>
export type RegisterEstateBalanceSuccessAction = ReturnType<typeof registerEstateBalanceSuccess>
export type RegisterEstateBalanceFailureAction = ReturnType<typeof registerEstateBalanceFailure>
