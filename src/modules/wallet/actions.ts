import { buildTransactionPayload } from 'decentraland-dapps/dist//modules/transaction/utils'
import { action } from 'typesafe-actions'
import { Wallet } from './types'

export const EXTEND_WALLET_REQUEST = '[Request] Extend wallet'
export const EXTEND_WALLET_SUCCESS = '[Success] Extend wallet'
export const EXTEND_WALLET_FAILURE = '[Failure] Extend wallet'

export const extendWalletRequest = () => action(EXTEND_WALLET_REQUEST, {})
export const extendWalletSuccess = (wallet: Wallet | null) => action(EXTEND_WALLET_SUCCESS, wallet)
export const extendWalletFailure = (error: string) => action(EXTEND_WALLET_FAILURE, { error })

export type ExtendWalletRequestAction = ReturnType<typeof extendWalletRequest>
export type ExtendWalletSuccessAction = ReturnType<typeof extendWalletSuccess>
export type ExtendWalletFailureAction = ReturnType<typeof extendWalletFailure>

export const ALLOW_MANA_REQUEST = '[Request] Allow mana'
export const ALLOW_MANA_SUCCESS = '[Success] Allow mana'
export const ALLOW_MANA_FAILURE = '[Failure] Allow mana'

export const allowManaRequest = () => action(ALLOW_MANA_REQUEST, {})
export const allowManaSuccess = (hash?: string) => action(ALLOW_MANA_SUCCESS, hash ? buildTransactionPayload(hash) : {})
export const allowManaFailure = (error: string) => action(ALLOW_MANA_FAILURE, { error })

export type AllowManaRequestAction = ReturnType<typeof allowManaRequest>
export type AllowManaSuccessAction = ReturnType<typeof allowManaSuccess>
export type AllowManaFailureAction = ReturnType<typeof allowManaFailure>

export const ALLOW_LAND_REQUEST = '[Request] Allow land'
export const ALLOW_LAND_SUCCESS = '[Success] Allow land'
export const ALLOW_LAND_FAILURE = '[Failure] Allow land'

export const allowLandRequest = () => action(ALLOW_LAND_REQUEST, {})
export const allowLandSuccess = (hash: string) => action(ALLOW_LAND_SUCCESS, buildTransactionPayload(hash))
export const allowLandFailure = (error: string) => action(ALLOW_LAND_FAILURE, { error })

export type AllowLandRequestAction = ReturnType<typeof allowLandRequest>
export type AllowLandSuccessAction = ReturnType<typeof allowLandSuccess>
export type AllowLandFailureAction = ReturnType<typeof allowLandFailure>

export const ALLOW_ESTATE_REQUEST = '[Request] Allow estate'
export const ALLOW_ESTATE_SUCCESS = '[Success] Allow estate'
export const ALLOW_ESTATE_FAILURE = '[Failure] Allow estate'

export const allowEstateRequest = () => action(ALLOW_ESTATE_REQUEST, {})
export const allowEstateSuccess = (hash: string) => action(ALLOW_ESTATE_SUCCESS, buildTransactionPayload(hash))
export const allowEstateFailure = (error: string) => action(ALLOW_ESTATE_FAILURE, { error })

export type AllowEstateRequestAction = ReturnType<typeof allowEstateRequest>
export type AllowEstateSuccessAction = ReturnType<typeof allowEstateSuccess>
export type AllowEstateFailureAction = ReturnType<typeof allowEstateFailure>

export const REVOKE_LAND_REQUEST = '[Request] Revoke land'
export const REVOKE_LAND_SUCCESS = '[Success] Revoke land'
export const REVOKE_LAND_FAILURE = '[Failure] Revoke land'

export const revokeLandRequest = () => action(REVOKE_LAND_REQUEST, {})
export const revokeLandSuccess = (hash: string) => action(REVOKE_LAND_SUCCESS, buildTransactionPayload(hash))
export const revokeLandFailure = (error: string) => action(REVOKE_LAND_FAILURE, { error })

export type RevokeLandRequestAction = ReturnType<typeof revokeLandRequest>
export type RevokeLandSuccessAction = ReturnType<typeof revokeLandSuccess>
export type RevokeLandFailureAction = ReturnType<typeof revokeLandFailure>

export const REVOKE_ESTATE_REQUEST = '[Request] Revoke estate'
export const REVOKE_ESTATE_SUCCESS = '[Success] Revoke estate'
export const REVOKE_ESTATE_FAILURE = '[Failure] Revoke estate'

export const revokeEstateRequest = () => action(REVOKE_ESTATE_REQUEST, {})
export const revokeEstateSuccess = (hash: string) => action(REVOKE_ESTATE_SUCCESS, buildTransactionPayload(hash))
export const revokeEstateFailure = (error: string) => action(REVOKE_ESTATE_FAILURE, { error })

export type RevokeEstateRequestAction = ReturnType<typeof revokeEstateRequest>
export type RevokeEstateSuccessAction = ReturnType<typeof revokeEstateSuccess>
export type RevokeEstateFailureAction = ReturnType<typeof revokeEstateFailure>

export const WRAP_MANA_REQUEST = '[Request] Wrap MANA'
export const WRAP_MANA_SUCCESS = '[Success] Wrap MANA'
export const WRAP_MANA_FAILURE = '[Failure] Wrap MANA'

export const wrapManaRequest = (amount: number) => action(WRAP_MANA_REQUEST, { amount })
export const wrapManaSuccess = (hash: string, amount: number) => action(WRAP_MANA_SUCCESS, buildTransactionPayload(hash, { amount }))
export const wrapManaFailure = (error: string, amount: number) => action(WRAP_MANA_FAILURE, { error, amount })

export type WrapManaRequestAction = ReturnType<typeof wrapManaRequest>
export type WrapManaSuccessAction = ReturnType<typeof wrapManaSuccess>
export type WrapManaFailureAction = ReturnType<typeof wrapManaFailure>

export const UNWRAP_MANA_REQUEST = '[Request] Unwrap MANA'
export const UNWRAP_MANA_SUCCESS = '[Success] Unwrap MANA'
export const UNWRAP_MANA_FAILURE = '[Failure] Unwrap MANA'

export const unwrapManaRequest = (amount: number) => action(UNWRAP_MANA_REQUEST, { amount })
export const unwrapManaSuccess = (hash: string, amount: number) => action(UNWRAP_MANA_SUCCESS, buildTransactionPayload(hash, { amount }))
export const unwrapManaFailure = (error: string, amount: number) => action(UNWRAP_MANA_FAILURE, { error, amount })

export type UnwrapManaRequestAction = ReturnType<typeof unwrapManaRequest>
export type UnwrapManaSuccessAction = ReturnType<typeof unwrapManaSuccess>
export type UnwrapManaFailureAction = ReturnType<typeof unwrapManaFailure>
