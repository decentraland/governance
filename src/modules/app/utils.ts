import { Time, Delay, SAB } from './types'
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

export function isApp(address: string, app: NetworkEnum) {
  switch (address) {
    case app[Network.MAINNET]:
    case app[Network.RINKEBY]:
      return true

    default:
      return false
  }
}
