import { JsonRpcProvider, getNetwork } from '@ethersproject/providers'

import { getEnvironmentChainId } from '../utils/votes/utils'

export default class DclRpcService {
  static async getBlockNumber(): Promise<number> {
    try {
      const url = this.getRpcUrl()
      const provider = new JsonRpcProvider(url)
      const block = await provider.getBlock('latest')
      return block.number
    } catch (err: any) {
      throw new Error("Couldn't get the latest block: " + err.message, err)
    }
  }

  public static getRpcUrl() {
    const network = getNetwork(Number(getEnvironmentChainId()))
    const networkName = network.name === 'homestead' ? 'mainnet' : network.name
    return process.env.RPC_PROVIDER_URL + networkName
  }

  public static polygon() {
    return new JsonRpcProvider(process.env.RPC_PROVIDER_URL + 'polygon')
  }
}
