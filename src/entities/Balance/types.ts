import { WalletAttributes } from '../Wallet/types'

export type BalanceAttributes = {
  id: string,
  wallet_id: string,
  token_id: string,
  amount: string,
  created_at: Date
}

export type TokenBalance = {
  name: string,
  decimals: number,
  amount: string,
}

export type AggregatedTokenBalance = {
  tokenTotal: TokenBalance
  tokenInWallets: TokenInWallet[]
}

export type TokenInWallet = {
  wallet: WalletAttributes,
  tokenBalance: TokenBalance,
}
