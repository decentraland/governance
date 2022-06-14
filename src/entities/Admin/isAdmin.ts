import { magenta } from 'colors/safe'
import env from 'decentraland-gatsby/dist/utils/env'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

export const ADMIN_ADDRESSES = (env('ADMIN_ADDRESSES', '') || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

const adminAddresses = new Set(ADMIN_ADDRESSES)

adminAddresses.forEach((address) => console.log('admin address:', magenta(address)))
