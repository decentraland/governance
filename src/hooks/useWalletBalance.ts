import { ChainId } from '@dcl/schemas'
import { Alchemy, TokenBalance } from '../api/Alchemy'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

const ethereumContracts : { [key: string]: { name: string, decimals: number } } = {
  'ether': { name: 'eth', decimals: 18 },
  '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': { name: 'mana', decimals: 18 },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'eth', decimals: 18 },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { name: 'dai', decimals: 18 },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { name: 'usdt', decimals: 6 },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { name: 'usdc', decimals: 6 },
}

const maticContracts : { [key: string]: { name: string, decimals: number } } = {
  'matic': { name: 'matic', decimals: 18 },
  '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4': { name: 'mana', decimals: 18 },
  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': { name: 'eth', decimals: 18 },
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': { name: 'dai', decimals: 18 },
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': { name: 'usdt', decimals: 6 },
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': { name: 'usdc', decimals: 6 },
}

export function useWalletBalance(
  account: string,
  chainId: ChainId
) {
  return useAsyncMemo(
    async () => {
      const contracts = chainId == ChainId.ETHEREUM_MAINNET ? Object.keys(ethereumContracts) : Object.keys(maticContracts)
      const balances = await Alchemy.get(chainId).getTokenBalances(account, contracts)
      const nativeBalance = await Alchemy.get(chainId).getNativeBalances(account)

      const nativeName = chainId == ChainId.ETHEREUM_MAINNET ? 'ether' : 'matic'
      balances.result.tokenBalances.push({'contractAddress': nativeName, 'tokenBalance': nativeBalance.result, 'error': ''})
      return balances.result.tokenBalances.filter(b => parseInt(b.tokenBalance))
    },
    [],
    { initialValue: [] }
  )
}

export function getTokenName(address: string) {
  return ethereumContracts[address]?.name || maticContracts[address]?.name
}

export function getTokenBalance(balance: TokenBalance) {
  const address = balance.contractAddress
  const decimals = ethereumContracts[address]?.decimals || maticContracts[address]?.decimals || 18
  return parseInt(balance.tokenBalance) / 10**decimals
}
