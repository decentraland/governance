import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { JsonRpcProvider, StaticJsonRpcProvider, getNetwork } from '@ethersproject/providers'

import { getEnvironmentChainId } from '../helpers'

export const ENVIRONMENT_RPC_TIMEOUT_MS = 10_000

export default class RpcService {
  static async getBlockNumber(): Promise<number> {
    try {
      const url = this.getRpcUrl()
      const provider = new JsonRpcProvider(url)
      const block = await provider.getBlock('latest')
      return block.number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      throw new Error("Couldn't get the latest block: " + err.message, err)
    }
  }

  public static getRpcUrl(chainId?: ChainId) {
    const network = getNetwork(Number(chainId) || Number(getEnvironmentChainId()))

    const networkName = network.name === 'homestead' ? 'mainnet' : network.name
    return process.env.RPC_PROVIDER_URL + networkName
  }

  /**
   * Provider for the Ethereum network this deployment runs on (GATSBY_DEFAULT_CHAIN_ID), for request
   * paths such as webhooks. The network is given up front, so no eth_chainId/net_version detection
   * call is made, and each request fails fast instead of using ethers' defaults (120 s timeout and up
   * to 12 backed-off retries on HTTP 429), which can hold a request open for minutes.
   */
  public static getEnvironmentProvider() {
    return new StaticJsonRpcProvider(
      { url: this.getRpcUrl(), timeout: ENVIRONMENT_RPC_TIMEOUT_MS, throttleLimit: 1 },
      Number(getEnvironmentChainId())
    )
  }

  public static getPolygonProvider() {
    return new JsonRpcProvider(process.env.POLYGON_RPC_URL)
  }
}
