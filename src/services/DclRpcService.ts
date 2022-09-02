import { Block, JsonRpcProvider, getNetwork } from '@ethersproject/providers'

import { getEnvironmentChainId } from '../modules/votes/utils'

export default class DclRpcService {
  static async getBlockNumber(): Promise<Block> {
    try {
      const network = getNetwork(Number(getEnvironmentChainId()))
      const networkName = network.name === 'homestead' ? 'mainnet' : network.name
      const url = process.env.RPC_PROVIDER_URL + networkName
      const provider = new JsonRpcProvider(url)
      return await provider.getBlock('latest')
    } catch (err: any) {
      throw new Error("Couldn't get the latest block: " + err.message, err)
    }
  }
}
