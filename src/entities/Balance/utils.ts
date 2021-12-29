import { ChainId } from '@dcl/schemas'
import { TokenBalancesResponse, Alchemy, TokenBalanceResponse } from '../../api/Alchemy'
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

export const NATIVE_CONTRACT = 'NATIVE'

export type TokenBalance = {
  name: string,
  decimals: number,
  amount: string,
}

export type WalletBalance = {
  wallet: WalletAttributes,
  tokenBalances: TokenBalance[]
}

export async function getNativeBalance(wallet: WalletAttributes) {
  const chainId = wallet.network
  const nativeBalance = await Alchemy.get(chainId).getNativeBalances(wallet.address)
  let nativeBalanceResult: TokenBalanceResponse = {
    'contractAddress': NATIVE_CONTRACT,
    'tokenBalance': nativeBalance.result,
    'error': null
  }
  return nativeBalanceResult
}

export async function getTokenBalancesFor(wallet: WalletAttributes): Promise<TokenBalanceResponse[]> {
  const chainId = wallet.network
  const contracts: string[] = await TokenModel.getContracts(chainId)
  const balances: TokenBalancesResponse = await Alchemy.get(chainId).getTokenBalances(wallet.address, contracts)
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
    const tokenBalances: TokenBalanceResponse[] = await getTokenBalancesFor(wallet)
    for (const tokenBalance of tokenBalances) {
      try {
        const token = await TokenModel.findMatchingToken(wallet.network, tokenBalance.contractAddress)
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

export async function calculateTotalsByToken(latestBalances: BalanceAttributes[]) {
  let manaTotal:bigint = BigInt(0)
  let usdcTotal:bigint = BigInt(0)
  let daiTotal:bigint = BigInt(0)
  let usdtTotal:bigint = BigInt(0)
  let ethereumTotal:bigint = BigInt(0)
  let maticTotal:bigint = BigInt(0)

  for (const balance of latestBalances) {
    const token: TokenAttributes = await TokenModel.findToken(balance.token_id)
    const parsedAmount = BigInt(balance.amount)
    switch (token.symbol) {
      case 'MANA':
        manaTotal += parsedAmount
        break
      case 'USDC':
        usdcTotal += parsedAmount
        break
      case 'DAI':
        daiTotal += parsedAmount
        break
      case 'USDT':
        usdtTotal += parsedAmount
        break
      case 'ETH':
        ethereumTotal += parsedAmount
        break
      case 'MATIC':
        maticTotal += parsedAmount
        break
      default:
        break
    }
  }

  return [
    {
      token: 'mana',
      symbol: 'MANA',
      totalAmount: toPaddedHexString(manaTotal),
      decimals: 18
    },
    {
      token: 'usdc',
      symbol: 'USDC',
      totalAmount: toPaddedHexString(usdcTotal),
      decimals: 6
    },
    {
      token: 'dai',
      symbol: 'DAI',
      totalAmount: toPaddedHexString(daiTotal),
      decimals: 18
    },
    {
      token: 'tether',
      symbol: 'USDT',
      totalAmount: toPaddedHexString(usdtTotal),
      decimals: 6
    },
    {
      token: 'ether',
      symbol: 'ETH',
      totalAmount: toPaddedHexString(ethereumTotal),
      decimals: 18
    },
    {
      token: 'matic',
      symbol: 'MATIC',
      totalAmount: toPaddedHexString(maticTotal),
      decimals: 18
    }]
}

function toPaddedHexString(num:bigint) {
  const str:string = num.toString(16);
  return '0x' + "0".repeat(64 - str.length) + str;
}

export async function getBalancesByWallet(latestBalances: BalanceAttributes[]) {
  const walletBalances: WalletBalance[] = []
  for (const balance of latestBalances) {
    const wallet = await WalletModel.findWallet(balance.wallet_id)
    const token: TokenAttributes = await TokenModel.findToken(balance.token_id)

    const walletBalance: WalletBalance | undefined = walletBalances.find(w => w?.wallet.id == wallet.id)
    if (!walletBalance) {
      walletBalances.push({
        wallet: wallet,
        tokenBalances: [{
          name: token.name,
          decimals: token.decimals,
          amount: balance.amount
        }]
      })
    } else {
      walletBalance.tokenBalances.push({
        name: token.name,
        decimals: token.decimals,
        amount: balance.amount
      })
    }
  }

  return walletBalances
}

export async function getAggregatedBalances() {
  const latestBalances: BalanceAttributes[] = await BalanceModel.findLatestBalances()

  return {
    totalsByToken: await calculateTotalsByToken(latestBalances),
    walletBalances: await getBalancesByWallet(latestBalances)
  }
}

