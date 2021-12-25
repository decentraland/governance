import { ChainId } from '@dcl/schemas'
import { TokenBalanceResponse, Alchemy, TokenBalance } from '../../api/Alchemy'
import WalletModel from '../Wallet/model'
import { WalletAttributes } from '../Wallet/types'
import { TokenAttributes } from '../Token/types'
import TokenModel from '../Token/model'
import { asNumber } from '../Proposal/utils'
import { BalanceAttributes } from './types'
import BalanceModel from './model'
import { v1 as uuid } from 'uuid'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

export async function getNativeBalance(wallet: WalletAttributes) {
  const chainId = wallet.network
  const nativeBalance = await Alchemy.get(chainId).getNativeBalances(wallet.address)
  const nativeName = chainId == ChainId.ETHEREUM_MAINNET ? 'ether' : 'matic'
  let nativeBalanceResult: TokenBalance = {
    'contractAddress': nativeName,
    'tokenBalance': nativeBalance.result,
    'error': null
  }
  return nativeBalanceResult
}

export async function getTokenBalancesFor(wallet: WalletAttributes):Promise<TokenBalance[]> {
  const chainId = wallet.network
  const contracts: string[] = await TokenModel.getNonNativeContracts(chainId)
  const balances: TokenBalanceResponse = await Alchemy.get(chainId).getTokenBalances(wallet.address, contracts)
  const tokenBalances = balances.result.tokenBalances

  const nativeBalanceResult = await getNativeBalance(wallet)
  tokenBalances.push(nativeBalanceResult)

  return tokenBalances.filter(balance => {
    if (balance.error === null) {
      return true
    } else {
      logger.error('Error while fetching token balance', {
        wallet: wallet,
        token: balance.contractAddress,
        error: balance.error
      })
      return false
    }
  });
}

export async function getBlockNumber(chainId: ChainId) {
  const blockNumber = await Alchemy.get(chainId).getBlockNumber()
  return blockNumber.result
}

export async function latestConsistentBlockNumber(chainId: ChainId) {
  let currentBlockNumber = await getBlockNumber(chainId)
  return (asNumber(currentBlockNumber) - asNumber(0x100)).toString(16)
}

export async function getBalances() {
  const createdBalances = []
  const errors = []

  const wallets: WalletAttributes[] = await WalletModel.find()

  for (const wallet of wallets) {
    const tokenBalances:TokenBalance[] = await getTokenBalancesFor(wallet)
    for (const tokenBalance of tokenBalances) {
      try {
        const token = await findMatchingToken(wallet.network, tokenBalance.contractAddress)
        const previousBalance = await BalanceModel.findLatest(wallet.id, token.id)
        if (previousBalance && previousBalance.amount === tokenBalance.tokenBalance) {
          return
        } else {
          const newBalance: BalanceAttributes = {
            id: uuid(),
            wallet_id: wallet.id,
            token_id: token.id,
            amount: tokenBalance.tokenBalance!,
            created_at: Time.utc().toJSON() as any
          }
          await BalanceModel.create(newBalance)
          createdBalances.push(newBalance)
        }
      } catch (err) {
        errors.push({ wallet: wallet, balance: tokenBalance, error: err.message })
      }
    }
  }

  if (errors.length > 0) {
    logger.error('Errors while creating balances: ', { errors: errors })
  }

  return createdBalances
}

async function findMatchingToken(network: ChainId, contractAddress: string) {
  let token = await TokenModel.findOne<TokenAttributes>({ network: network, contract: contractAddress })
  if (!token) {
    throw new Error(`Could not find matching token for contract ${contractAddress} in network ${network}`)
  }
  return token
}

export function calculateTotalsByToken(balancesByWallet: { walletName: string; tokenBalances: ({ decimals: number; tokenName: string; tokenBalance: string })[]; network: number }) {
  return {}
}

export async function getAggregatedBalances() {

  const balancesByWallet = {
    walletName: 'Aragon Agent', network: 1, tokenBalances: [
      {
        tokenName: 'mana',
        tokenBalance: '0x00000000000000000000000000000000000000000019e6973c9090d9ed916663',
        decimals: 18
      },
      {
        tokenName: 'ether',
        tokenBalance: '0x0000000000000000000000000000000000000000000000000000000000000000',
        decimals: 18
      },
      {
        tokenName: 'dai',
        tokenBalance: '0x0000000000000000000000000000000000000000000153d102070746599ee535',
        decimals: 18
      },
      {
        tokenName: 'tether',
        tokenBalance: '0x0000000000000000000000000000000000000000000000000000015141731305',
        decimals: 6
      },
      {
        tokenName: 'usdc',
        tokenBalance: '0x0000000000000000000000000000000000000000000000000000010e39baf2d7',
        decimals: 6
      },
      { tokenName: 'ether', tokenBalance: '0x27007b89f926e00', decimals: 18 }
    ]
  }
  const aggregatedBalances = calculateTotalsByToken(balancesByWallet)
  return aggregatedBalances
}

