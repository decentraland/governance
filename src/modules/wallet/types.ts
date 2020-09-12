import { Wallet as BaseWallet } from 'decentraland-dapps/dist/modules/wallet/types'

export enum Network {
  MAINNET = 1,
  RINKEBY = 4
}

export type NetworkEnum = {
  [Network.MAINNET]: string
  [Network.RINKEBY]: string
}

export const NetworkName = {
  [Network.MAINNET]: "mainnet",
  [Network.RINKEBY]: "rinkeby"
}

export const EtherScan = {
  [Network.MAINNET]: "https://etherscan.io",
  [Network.RINKEBY]: "https://rinkeby.etherscan.io"
}

export type Wallet = BaseWallet & {
  land?: number
  landCommit?: boolean
  estate?: number
  estateSize?: number
  estateCommit?: boolean
  manaCommit?: boolean
  manaMiniMe?: number
  manaVotingPower?: number
  landVotingPower?: number
  estateVotingPower?: number
  votingPower?: number
}
