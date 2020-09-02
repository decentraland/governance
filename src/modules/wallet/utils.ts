import { Network } from './types'

export function ensureNetwork(net: any): Network | null {
  switch (net) {
    case Network.MAINNET:
    case Network.RINKEBY:
      return net

    default:
      return null
  }
}