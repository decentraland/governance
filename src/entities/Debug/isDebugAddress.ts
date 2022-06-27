import { magenta } from 'colors/safe'
import env from 'decentraland-gatsby/dist/utils/env'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

export const DEBUG_ADDRESSES = (env('DEBUG_ADDRESSES', '') || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

const debugAddresses = new Set(DEBUG_ADDRESSES)

debugAddresses.forEach((address) => console.log('debug address:', magenta(address)))
