import { ChainId } from '@dcl/schemas'
import API from 'decentraland-gatsby/dist/utils/api/API';
import { BlockNumberResponse, BalanceResponse, TokenBalanceResponse } from '../Alchemy'
import { TokenAttributes } from '../../entities/Token/types'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { WalletAttributes } from '../../entities/Wallet/types'

export const token1: TokenAttributes = {
  id: 'token id 1',
  contract: 'token contract 1',
  network: ChainId.ETHEREUM_MAINNET,
  name: 'token name 1',
  symbol: 'token symbol 1',
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export const token2: TokenAttributes = {
  id: 'token id 2',
  contract: 'token contract 2',
  network: ChainId.ETHEREUM_MAINNET,
  name: 'token name 2',
  symbol: 'token symbol 2',
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export const ethereumWallet: WalletAttributes = {
  id: 'wallet id eth',
  address: 'eth wallet address',
  network: ChainId.ETHEREUM_MAINNET,
  name: 'eth wallet name',
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export const maticWallet: WalletAttributes = {
  id: 'matic wallet id',
  address: 'matic wallet address',
  network: ChainId.MATIC_MAINNET,
  name: 'matic wallet name',
  created_at: Time.date('2021-12-16 15:42:12.222474')
}

export const someTokensWithError:TokenBalanceResponse = {
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "address": "0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce",
    "tokenBalances": [
      {
        "contractAddress": token1.contract,
        "tokenBalance": null,
        "error": "some error!"
      },
      {
        "contractAddress": token2.contract,
        "tokenBalance": "0x0000000000000000000000000000000000000000000153d102070746599ee535",
        "error": null
      },
    ]
  }
}

export const allTokensWithError:TokenBalanceResponse = {
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "address": "0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce",
    "tokenBalances": [
      {
        "contractAddress": token1.contract,
        "tokenBalance": null,
        "error": "some error!"
      },
      {
        "contractAddress": token2.contract,
        "tokenBalance": null,
        "error": "another error!"
      },
    ]
  }
}

export default class AlchemyMock extends API {

  static get(chain: ChainId) {
    return new AlchemyMock()
  }

  async getTokenBalances(address: string, tokens: string[]):Promise<TokenBalanceResponse> {
    return {
      "jsonrpc": "2.0",
      "id": 1,
      "result": {
        "address": ethereumWallet.address,
        "tokenBalances": [
          {
            "contractAddress": token1.contract,
            "tokenBalance": "0x00000000000000000000000000000000000000000019dcd03f58969775a16663",
            "error": null
          },
          {
            "contractAddress": token2.contract,
            "tokenBalance": "0x0000000000000000000000000000000000000000000153d102070746599ee535",
            "error": null
          },
        ]
      }
    }
  }

  async getBlockNumber<P extends keyof BlockNumberResponse>() {
    return {
      "jsonrpc":"2.0",
      "id": 0,
      "result":"0xd352a6",
    }
  }

  async getNativeBalances<P extends keyof BalanceResponse>(address: string, blockNumber: string = 'latest') {
    return {
      "jsonrpc": "2.0",
      "id": 1,
      "result": "0x27007b89f926e00"
    }
  }
}
