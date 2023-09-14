import chalk from 'chalk'
import env from 'decentraland-gatsby/dist/utils/env'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

export const DEBUG_ADDRESSES = (env('DEBUG_ADDRESSES', '') || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

const debugAddresses = new Set(DEBUG_ADDRESSES)

debugAddresses.forEach((address) => console.log('debug address:', chalk.magenta(address)))

export default function isDebugAddress(address: string | undefined) {
  return address && address.length > 0 && debugAddresses.has(address.toLowerCase())
}
