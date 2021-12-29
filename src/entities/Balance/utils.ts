import { ChainId } from '@dcl/schemas'
import { TokenBalancesResponse, Alchemy, TokenBalanceResponse } from '../../api/Alchemy'
import WalletModel from '../Wallet/model'
import { WalletAttributes } from '../Wallet/types'
import { TokenAttributes } from '../Token/types'
import TokenModel from '../Token/model'
import { asNumber } from '../Proposal/utils'
import { BalanceAttributes, AggregatedTokenBalance, TokenBalance } from './types'
import BalanceModel from './model'
import { v1 as uuid } from 'uuid'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

export const NATIVE_CONTRACT = 'NATIVE'

export function formattedTokenBalance(tokenBalance: TokenBalance) {
  return (BigInt(tokenBalance.amount) / BigInt(10 ** tokenBalance.decimals)).toString(16)
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

export async function aggregateBalances(latestBalances: BalanceAttributes[]):Promise<AggregatedTokenBalance[]> {
  const transparencyTokens:Partial<TokenAttributes>[] = await TokenModel.getTokenList()
  const tokenBalances:AggregatedTokenBalance[] = []

  for (const token of transparencyTokens) {
    tokenBalances.push({
      tokenTotal: {
        name: token.name!,
        amount: toPaddedHexString(0),
        decimals: token.decimals!
      },
      tokenInWallets: []
    })
  }

  for (const balance of latestBalances) {
    const token: TokenAttributes = await TokenModel.findToken(balance.token_id)
    const wallet = await WalletModel.findWallet(balance.wallet_id)
    const parsedAmount = BigInt(balance.amount)

    for (const tokenBalance of tokenBalances) {
      if (token.name == tokenBalance.tokenTotal.name) {
        tokenBalance.tokenTotal.amount = toPaddedHexString(BigInt(tokenBalance.tokenTotal.amount) + parsedAmount)
        tokenBalance.tokenInWallets.push({
          wallet: wallet,
          tokenBalance: {
            name: token.name,
            decimals: token.decimals,
            amount: balance.amount
          }
        })
      }
    }
  }

  return tokenBalances
}

function toPaddedHexString(num:bigint|number) {
  const str:string = num.toString(16);
  return '0x' + "0".repeat(64 - str.length) + str;
}

