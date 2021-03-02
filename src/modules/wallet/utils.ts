import { ChainId } from '@dcl/schemas';
import { env } from 'decentraland-commons'
import { Network } from './types'

const DEFAULT_NETWORK: Network = Number(env.get('REACT_APP_DEFAULT_NETWORK', 1))

export function ensureNetwork(net: any): Network | null {
  switch (net) {
    case Network.MAINNET:
    case Network.RINKEBY:
      return net

    default:
      return null
  }
}

export function environmentNetwork(): Network {
  return ensureNetwork(Number((window as any)?.ethereum?.chainId || 0)) ||
  ensureNetwork(DEFAULT_NETWORK) ||
  Network.MAINNET
}

export function environmentChainId() {
  const network = environmentNetwork()
  switch(network) {
    case Network.MAINNET:
      return ChainId.ETHEREUM_MAINNET;
    case Network.RINKEBY:
      return ChainId.ETHEREUM_RINKEBY;
  }
}