import { ethers } from 'ethers'
import { createSelector } from 'reselect'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getNetwork as getStoreNetwork, getAddress, isConnecting, getError } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/root/types'
import { Network } from './types'
import { ensureNetwork, environmentNetwork } from './utils'
import { EXTEND_WALLET_REQUEST, ALLOW_ESTATE_REQUEST, ALLOW_LAND_REQUEST, WRAP_MANA_REQUEST, UNWRAP_MANA_REQUEST, ALLOW_LAND_SUCCESS, ALLOW_ESTATE_SUCCESS, WRAP_MANA_SUCCESS, UNWRAP_MANA_SUCCESS, ALLOW_MANA_REQUEST, ALLOW_MANA_SUCCESS, REVOKE_LAND_SUCCESS, REVOKE_LAND_REQUEST, REVOKE_ESTATE_REQUEST, REVOKE_ESTATE_SUCCESS } from './actions'
import { createIsPendingTransactionSelector } from 'modules/transaction/selectors'

export { getError }
export const getState = (state: RootState) => state.wallet
export const getData = (state: RootState) => getState(state).data
export const isLoading = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, EXTEND_WALLET_REQUEST)

export const isAllowingManaPending = createIsPendingTransactionSelector(ALLOW_MANA_SUCCESS)
export const isAllowingLandPending = createIsPendingTransactionSelector(ALLOW_LAND_SUCCESS)
export const isRevokingLandPending = createIsPendingTransactionSelector(REVOKE_LAND_SUCCESS)
export const isAllowingEstatePending = createIsPendingTransactionSelector(ALLOW_ESTATE_SUCCESS)
export const isRevokingEstatePending = createIsPendingTransactionSelector(REVOKE_ESTATE_SUCCESS)
export const isWrapManaPending = createIsPendingTransactionSelector(WRAP_MANA_SUCCESS)
export const isUnwrapManaPending = createIsPendingTransactionSelector(UNWRAP_MANA_SUCCESS)

export const isAllowingMana = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, ALLOW_MANA_REQUEST) || isAllowingManaPending(state)
export const isAllowingLand = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, ALLOW_LAND_REQUEST) || isAllowingLandPending(state)
export const isRevokingLand = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, REVOKE_LAND_REQUEST) || isRevokingLandPending(state)
export const isAllowingEstate = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, ALLOW_ESTATE_REQUEST) || isAllowingEstatePending(state)
export const isRevokingEstate = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, REVOKE_ESTATE_REQUEST) || isRevokingEstatePending(state)
export const isWrappingMana = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, WRAP_MANA_REQUEST) || isWrapManaPending(state)
export const isUnwrappingMana = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, UNWRAP_MANA_REQUEST) || isUnwrapManaPending(state)

export const getNetwork = (state: RootState): Network => {
  return ensureNetwork(getStoreNetwork(state)) || environmentNetwork()
}

export const getProvider = createSelector(
  getAddress,
  () => (window as any)?.ethereum as ethers.providers.ExternalProvider,
  (_address, injectedProvider) => injectedProvider ? new ethers.providers.Web3Provider(injectedProvider) : undefined
)
