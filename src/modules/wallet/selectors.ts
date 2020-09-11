import { Eth } from 'web3x-es/eth'
import { ethers } from 'ethers'
import { createSelector } from 'reselect'
import { env } from 'decentraland-commons'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { getNetwork as getStoreNetwork, getAddress, isConnecting, getError } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/root/types'
import { Network } from './types'
import { ensureNetwork } from './utils'
import { LOAD_BALANCE_REQUEST, REGISTER_ESTATE_BALANCE_REQUEST, REGISTER_LAND_BALANCE_REQUEST, WRAP_MANA_REQUEST, UNWRAP_MANA_REQUEST, REGISTER_LAND_BALANCE_SUCCESS, REGISTER_ESTATE_BALANCE_SUCCESS, WRAP_MANA_SUCCESS, UNWRAP_MANA_SUCCESS } from './actions'
import { createPendingTransactionSelector } from 'modules/transaction/selectors'

const DEFAULT_NETWORK: Network = Number(env.get('REACT_APP_DEFAULT_NETWORK', 1))

export { getError }
export const getState = (state: RootState) => state.wallet
export const getData = (state: RootState) => getState(state).data
export const isLoading = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, LOAD_BALANCE_REQUEST)
export const isRegisteringLand = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, REGISTER_LAND_BALANCE_REQUEST)
export const isRegisteringEstate = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, REGISTER_ESTATE_BALANCE_REQUEST)
export const isWrappingMana = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, WRAP_MANA_REQUEST)
export const isUnwrappingMana = (state: RootState) => isConnecting(state) || isLoadingType(getState(state).loading, UNWRAP_MANA_REQUEST)
export const isRegisterLandPending = createPendingTransactionSelector(REGISTER_LAND_BALANCE_SUCCESS)
export const isRegisterEstatePending = createPendingTransactionSelector(REGISTER_ESTATE_BALANCE_SUCCESS)
export const isWrapManaPending = createPendingTransactionSelector(WRAP_MANA_SUCCESS)
export const isUnwrapManaPending = createPendingTransactionSelector(UNWRAP_MANA_SUCCESS)

export const getNetwork = (state: RootState): Network => {
  return ensureNetwork(getStoreNetwork(state)) ||
    ensureNetwork(Number((window as any)?.ethereum?.chainId || 0)) ||
    ensureNetwork(DEFAULT_NETWORK) ||
    Network.MAINNET
}

let eth: Eth | null = null
export const getEth = () => {
  if (!eth) {
    eth = Eth.fromCurrentProvider() || null
  }

  return eth
}

export const getProvider = createSelector(
  getAddress,
  () => (window as any)?.ethereum as ethers.providers.ExternalProvider,
  (_address, injectedProvider) => injectedProvider ? new ethers.providers.Web3Provider(injectedProvider) : undefined
)
