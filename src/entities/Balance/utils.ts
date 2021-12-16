import { ChainId } from '@dcl/schemas'
import { TokenBalanceResponse, Alchemy, TokenBalance } from '../../api/Alchemy'
import WalletModel from '../Wallet/model'
import { WalletAttributes } from '../Wallet/types'
import { TokenAttributes } from '../Token/types'
import TokenModel from '../Token/model'
import { BalanceAttributes } from './types'

export async function getWalletBalance(wallet:WalletAttributes) {
  const chainId = wallet.network
  const tokens:TokenAttributes[] = await TokenModel.find<TokenAttributes>({network: wallet.network})
  const contracts = tokens.map(t => t.contract)

  const balances:TokenBalanceResponse = await Alchemy.get(chainId).getTokenBalances(wallet.address, contracts)
  const nativeBalance = await Alchemy.get(chainId).getNativeBalances(wallet.address)

  const nativeName = chainId == ChainId.ETHEREUM_MAINNET ? 'ether' : 'matic'
  balances.result.tokenBalances.push({
    'contractAddress': nativeName,
    'tokenBalance': nativeBalance.result,
    'error': ''
  })
  return balances.result.tokenBalances.filter(b => parseInt(b.tokenBalance))
}
//
// export async function getBalances(){
//   const wallets:WalletAttributes[] = await WalletModel.find({})
//   const balances = wallets.map(w => getWalletBalance(w))
//   balances.forEach()
//
//   const balance: BalanceAttributes = {
//     id: ,
//     wallet_id: wallet.id,
//     token_id: token.id,
//     amount: tokenBalance,
//     created_at: now
//   }
//
//   await BalanceModel.create(balance)
//   return balance
// }


const aragonBalance = [
  {
    "contractAddress": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
    "tokenBalance": "0x00000000000000000000000000000000000000000019db44f4408819e61de663",
    "error": null
  },
  {
    "contractAddress": "0x6b175474e89094c44da98b954eedeac495271d0f",
    "tokenBalance": "0x0000000000000000000000000000000000000000000153d102070746599ee535",
    "error": null
  },
  {
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "tokenBalance": "0x0000000000000000000000000000000000000000000000000000015141731305",
    "error": null
  },
  {
    "contractAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "tokenBalance": "0x0000000000000000000000000000000000000000000000000000010e39baf2d7",
    "error": null
  },
  {
    "contractAddress": "ether",
    "tokenBalance": "0x27007b89f926e00",
    "error": ""
  }
]

const gnosisEthBalance = [
  {
    "contractAddress": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
    "tokenBalance": "0x0000000000000000000000000000000000000000000002415670ade1b6280000",
    "error": null
  },
  {
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "tokenBalance": "0x000000000000000000000000000000000000000000000000000000a74dbfebdc",
    "error": null
  },
  {
    "contractAddress": "ether",
    "tokenBalance": "0x2e869f66ca39b793",
    "error": ""
  }
]

const gnosisMaticBalance = [
  {
    "contractAddress": "0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4",
    "tokenBalance": "0x0000000000000000000000000000000000000000000084b41a14b6cdb3448000",
    "error": null
  },
  {
    "contractAddress": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    "tokenBalance": "0x0000000000000000000000000000000000000000000000000d35257f4bdbd39f",
    "error": null
  },
  {
    "contractAddress": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    "tokenBalance": "0x0000000000000000000000000000000000000000000000019b79f5e856550000",
    "error": null
  },
  {
    "contractAddress": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "tokenBalance": "0x000000000000000000000000000000000000000000000000000000000146eb68",
    "error": null
  },
  {
    "contractAddress": "matic",
    "tokenBalance": "0x4563918244f40000",
    "error": ""
  }
]
