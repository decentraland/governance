import { ChainId } from '@dcl/schemas'
import API from 'decentraland-gatsby/dist/utils/api/API';

export type TokenBalanceResponse = {
  contractAddress: string,
  tokenBalance: string | null,
  error: string | null,
}

export type TokenBalancesResponse = {
  id: number,
  jsonrpc: string,
  result:{
    address: string,
    tokenBalances: TokenBalanceResponse[],
  },
}

export type BalanceResponse = {
  id: number,
  jsonrpc: string,
  result: string,
}

export type BlockNumberResponse = {
  id: number,
  jsonrpc: string,
  result: string,
}

export class Alchemy extends API {

  static Cache = new Map<string, Alchemy>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get(chain: ChainId) {
    switch (chain) {
      case ChainId.ETHEREUM_MAINNET:
        return this.from('https://eth-mainnet.alchemyapi.io')
      case ChainId.MATIC_MAINNET:
        return this.from('https://polygon-mainnet.g.alchemy.com')
    }
    throw new Error('Unsuported chain id')
  }

  async getTokenBalances<P extends keyof TokenBalancesResponse>(address: string, tokens: string[]) {
    return await this.fetch<TokenBalancesResponse>(
      '/v2/HcW-dJIcedLgGAB8htL7M1L8ir2Sihfe',
      this.options()
        .method('POST')
        .json({
          "jsonrpc": "2.0",
          "method": "alchemy_getTokenBalances",
          "id": "1",
          "params": [address, tokens]
        })
    )
  }

  async getBlockNumber<P extends keyof BlockNumberResponse>() {
    return await this.fetch<BlockNumberResponse>(
      '/v2/HcW-dJIcedLgGAB8htL7M1L8ir2Sihfe',
      this.options()
        .method('POST')
        .json({
          "jsonrpc": "2.0",
          "method": "eth_blockNumber",
          "id": "0",
          "params": []
        })
    )
  }

  async getNativeBalances<P extends keyof BalanceResponse>(address: string, blockNumber: string = 'latest') {
    return await this.fetch<BalanceResponse>(
      '/v2/HcW-dJIcedLgGAB8htL7M1L8ir2Sihfe',
      this.options()
        .method('POST')
        .json({
          "jsonrpc": "2.0",
          "method": "eth_getBalance",
          "id": "1",
          "params": [address, blockNumber]
        })
    )
  }
}
