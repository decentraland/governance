import { ChainId } from '@dcl/schemas'
import API from 'decentraland-gatsby/dist/utils/api/API';
import { BlockNumberResponse, BalanceResponse, TokenBalancesResponse } from '../Alchemy'
import { token1, token2, ethereumWallet } from '../../entities/Balance/__mock__/mockedBalances'


export const someTokensWithError:TokenBalancesResponse = {
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

export const allTokensWithError:TokenBalancesResponse = {
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

  async getTokenBalances(address: string, tokens: string[]):Promise<TokenBalancesResponse> {
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
