import { Wallet as BaseWallet } from 'decentraland-dapps/dist/modules/wallet/types'

export enum Network {
  MAINNET = 1,
  RINKEBY = 4
}

export const NetworkName = {
  [Network.MAINNET]: "mainnet",
  [Network.RINKEBY]: "rinkeby"
}

export type Wallet = BaseWallet & {
  land?: number
  landCommit?: boolean
  estate?: number
  estateSize?: number
  estateCommit?: boolean
  manaMiniMe?: number
  manaVotingPower?: number
  landVotingPower?: number
  estateVotingPower?: number
  votingPower?: number
}
