import { ChainId } from '@dcl/schemas'
import API from 'decentraland-gatsby/dist/utils/api/API';

export type TokenBalance = {
  contractAddress: string,
  tokenBalance: string,
  error: string,
}

export type TokenBalanceResponse = {
  id: number,
  jsonpc: string,
  result:{
    address: string,
    tokenBalances: TokenBalance[],
  },
}

export type BalanceResponse = {
  id: number,
  jsonpc: string,
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

  async getTokenBalances<P extends keyof TokenBalanceResponse>(address: string, tokens: string[]) {
    return await this.fetch<TokenBalanceResponse>(
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

  async getNativeBalances<P extends keyof BalanceResponse>(address: string) {
    return await this.fetch<BalanceResponse>(
      '/v2/HcW-dJIcedLgGAB8htL7M1L8ir2Sihfe',
      this.options()
        .method('POST')
        .json({
          "jsonrpc": "2.0",
          "method": "eth_getBalance",
          "id": "1",
          "params": [address, "latest"]
        })
    )
  }
}
