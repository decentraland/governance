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

export async function getWalletBalance(wallet: WalletAttributes) {
  const chainId = wallet.network
  const tokens: TokenAttributes[] = await TokenModel.find<TokenAttributes>({ network: chainId })
  const contracts = tokens.map(t => t.contract)

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
  const wallets: WalletAttributes[] = await WalletModel.find({})

  const errors = []

  for (const wallet of wallets) {
    const balances = await getWalletBalance(wallet)
    for (const balance of balances) {
      try {
        const token = await findMatchingToken(wallet, balance)
        const newBalance: BalanceAttributes = {
          id: uuid(),
          wallet_id: wallet.id,
          token_id: token.id,
          amount: balance.tokenBalance!,
          created_at: Time.utc().toJSON() as any
        }
        await BalanceModel.create(newBalance)
      } catch (error) {
        errors.push({ wallet: wallet, balance: balance, error: error })
      }
    }
  }

  if (errors) {
    logger.error('Errors while creating balances: ', { errors: errors })
  }
}

async function findMatchingToken(wallet: WalletAttributes, balance: TokenBalance) {
  let token = await TokenModel.findOne<TokenAttributes>({ network: wallet.network, contract: balance.contractAddress })
  if (!token) {
    throw new Error(`Could not find matching token for contract "${balance.contractAddress}" in network "${wallet.network}"`)
  }
  return token
}

