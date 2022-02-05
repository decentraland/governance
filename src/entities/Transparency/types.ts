export type TokenInWallet = {
  symbol: string,
  contractAddress: string,
  amount: bigint,
  quote: bigint,
  name: string,
  network: string,
  address: string,
  timestamp: Date,
}

export type TokenTotal = {
  symbol: string,
  amount: bigint,
  quote: bigint,
}

export type AggregatedTokenBalance = {
  tokenTotal: TokenTotal
  tokenInWallets: TokenInWallet[]
}

export type BlockExplorerLink = {
  link: string,
  name: string,
}

export type Team = {
  name: string
  description: string,
  members: { name:string, address:string }[]
}
