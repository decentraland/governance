import { magenta } from 'colors/safe'

import { DEBUG_ADDRESSES } from '../../constants'

const debugAddresses = new Set(DEBUG_ADDRESSES)

debugAddresses.forEach((address) => console.log('debug address:', magenta(address)))

export default function isDebugAddress(address: string | undefined) {
  return address && address.length > 0 && debugAddresses.has(address.toLowerCase())
}
