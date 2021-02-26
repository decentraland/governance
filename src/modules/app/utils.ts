import { Time, Delay, SAB, COMMUNITY, INBOX, Agent, BanName, Catalyst, POI, Finance, Tokens,  AppName } from './types'
import { Network, NetworkEnum } from 'modules/wallet/types'

export function getAppDelay(address: string) {
  switch (address) {
    case SAB[Network.MAINNET]:
    case SAB[Network.RINKEBY]:
    case Delay[Network.MAINNET]:
    case Delay[Network.RINKEBY]:
      return Time.Day

    default:
      return Time.Day * 7
  }
}

export function getAppName(address?: string) {
  switch (address) {
    case SAB[Network.MAINNET]:
    case SAB[Network.RINKEBY]:
      return AppName.SAB

    case COMMUNITY[Network.MAINNET]:
    case COMMUNITY[Network.RINKEBY]:
      return AppName.COMMUNITY

    case INBOX[Network.MAINNET]:
    case INBOX[Network.RINKEBY]:
      return AppName.INBOX

    case Delay[Network.MAINNET]:
    case Delay[Network.RINKEBY]:
      return AppName.Delay

    case Agent[Network.MAINNET]:
    case Agent[Network.RINKEBY]:
      return AppName.Agent

    case BanName[Network.MAINNET]:
    case BanName[Network.RINKEBY]:
      return AppName.BanName

    case Catalyst[Network.MAINNET]:
    case Catalyst[Network.RINKEBY]:
      return AppName.Catalyst

    case POI[Network.MAINNET]:
    case POI[Network.RINKEBY]:
      return AppName.POI

    case Finance[Network.MAINNET]:
    case Finance[Network.RINKEBY]:
      return AppName.Finance

    case Tokens[Network.MAINNET]:
    case Tokens[Network.RINKEBY]:
      return AppName.Tokens

    default:
      return undefined
  }
}

export function isApp(address: string, app: NetworkEnum) {
  switch (address) {
    case app[Network.MAINNET]:
    case app[Network.RINKEBY]:
      return true

    default:
      return false
  }
}
