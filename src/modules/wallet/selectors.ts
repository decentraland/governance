import { getNetwork as getStoreNetwork } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { env } from 'decentraland-commons'
import { RootState } from 'modules/root/types'
import { Network } from './types'
import { ensureNetwork } from './utils'

const DEFAULT_NETWORK: Network = Number(env.get('REACT_APP_DEFAULT_NETWORK', 1))

export const getNetwork = (state: RootState): Network => {
  return ensureNetwork(getStoreNetwork(state)) ||
    ensureNetwork(Number((window as any)?.ethereum?.chainId || 0)) ||
    ensureNetwork(DEFAULT_NETWORK) ||
    Network.MAINNET
}
