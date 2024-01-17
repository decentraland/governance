import chalk from 'chalk'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import env from '../../config'

export const COMMITTEE_ADDRESSES = (env('COMMITTEE_ADDRESSES', '') || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

const committeeAddresses = new Set(COMMITTEE_ADDRESSES)

committeeAddresses.forEach((address) => console.log('committee address:', chalk.yellow(address)))

export default function isDAOCommittee(user?: string | null | undefined) {
  if (!user) {
    return false
  }

  return committeeAddresses.has(user)
}
