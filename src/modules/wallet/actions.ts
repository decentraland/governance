import { buildTransactionPayload } from 'decentraland-dapps/dist//modules/transaction/utils'
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
export const registerLandBalanceSuccess = (hash: string) => action(REGISTER_LAND_BALANCE_SUCCESS, buildTransactionPayload(hash))
export const registerLandBalanceFailure = (error: string) => action(REGISTER_LAND_BALANCE_FAILURE, { error })

export type RegisterLandBalanceRequestAction = ReturnType<typeof registerLandBalanceRequest>
export type RegisterLandBalanceSuccessAction = ReturnType<typeof registerLandBalanceSuccess>
export type RegisterLandBalanceFailureAction = ReturnType<typeof registerLandBalanceFailure>

export const REGISTER_ESTATE_BALANCE_REQUEST = '[Request] Register estate balance'
export const REGISTER_ESTATE_BALANCE_SUCCESS = '[Success] Register estate balance'
export const REGISTER_ESTATE_BALANCE_FAILURE = '[Failure] Register estate balance'

export const registerEstateBalanceRequest = () => action(REGISTER_ESTATE_BALANCE_REQUEST, {})
export const registerEstateBalanceSuccess = (hash: string) => action(REGISTER_ESTATE_BALANCE_SUCCESS, buildTransactionPayload(hash))
export const registerEstateBalanceFailure = (error: string) => action(REGISTER_ESTATE_BALANCE_FAILURE, { error })

export type RegisterEstateBalanceRequestAction = ReturnType<typeof registerEstateBalanceRequest>
export type RegisterEstateBalanceSuccessAction = ReturnType<typeof registerEstateBalanceSuccess>
export type RegisterEstateBalanceFailureAction = ReturnType<typeof registerEstateBalanceFailure>

export const WRAP_MANA_REQUEST = '[Request] Wrap MANA'
export const WRAP_MANA_SUCCESS = '[Success] Wrap MANA'
export const WRAP_MANA_FAILURE = '[Failure] Wrap MANA'

export const wrapManaRequest = (amount: number) => action(WRAP_MANA_REQUEST, { amount })
export const wrapManaSuccess = (hash: string) => action(WRAP_MANA_SUCCESS, buildTransactionPayload(hash))
export const wrapManaFailure = (error: string) => action(WRAP_MANA_FAILURE, { error })

export type WrapManaRequestAction = ReturnType<typeof wrapManaRequest>
export type WrapManaSuccessAction = ReturnType<typeof wrapManaSuccess>
export type WrapManaFailureAction = ReturnType<typeof wrapManaFailure>

export const UNWRAP_MANA_REQUEST = '[Request] Unwrap MANA'
export const UNWRAP_MANA_SUCCESS = '[Success] Unwrap MANA'
export const UNWRAP_MANA_FAILURE = '[Failure] Unwrap MANA'

export const unwrapManaRequest = (amount: number) => action(UNWRAP_MANA_REQUEST, { amount })
export const unwrapManaSuccess = (hash: string) => action(UNWRAP_MANA_SUCCESS, buildTransactionPayload(hash))
export const unwrapManaFailure = (error: string) => action(UNWRAP_MANA_FAILURE, { error })

export type UnwrapManaRequestAction = ReturnType<typeof unwrapManaRequest>
export type UnwrapManaSuccessAction = ReturnType<typeof unwrapManaSuccess>
export type UnwrapManaFailureAction = ReturnType<typeof unwrapManaFailure>
