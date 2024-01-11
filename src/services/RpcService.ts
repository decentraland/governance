import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { JsonRpcProvider, getNetwork } from '@ethersproject/providers'

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

  public static getRpcUrl() {
    /* WARNING: USING ONLY MAINNET */
    const network = getNetwork(Number(ChainId.ETHEREUM_MAINNET))
    // const network = getNetwork(Number(getEnvironmentChainId()))

    const networkName = network.name === 'homestead' ? 'mainnet' : network.name
    return process.env.RPC_PROVIDER_URL + networkName
  }

  public static getPolygonProvider() {
    return new JsonRpcProvider(process.env.POLYGON_RPC_URL)
  }
}
