import { JsonRpcProvider, getNetwork } from '@ethersproject/providers'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'

import { getEnvironmentChainId } from '../modules/votes/utils'

export default class DclRpcService {
  // TODO: Services should throw Error, RequestErros should only be known to routers
  static async getBlockNumber() {
    try {
      const network = getNetwork(Number(getEnvironmentChainId()))
      console.log('network', network)
      const networkName = network.name === 'homestead' ? 'mainnet' : network.name
      console.log('networkName', networkName)
      const url = process.env.RPC_PROVIDER_URL + networkName
      const provider = new JsonRpcProvider(url)
      return await provider.getBlock('latest')
    } catch (err) {
      throw new RequestError("Couldn't get the latest block", RequestError.InternalServerError, err as Error)
    }
  }
}
