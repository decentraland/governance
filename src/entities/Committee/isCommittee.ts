import { yellow } from 'colors/safe'
import env from 'decentraland-gatsby/dist/utils/env'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

export const COMMITTEE_ADDRESSES = (env('COMMITTEE_ADDRESSES', '') || '')
  .split(',')
  .filter(isEthereumAddress)
  .map(address => address.toLowerCase())

const committeeAddresses = new Set(COMMITTEE_ADDRESSES)

committeeAddresses.forEach(address => console.log('committee address:', yellow(address)))

export default function isCommitee(user?: string | null | undefined) {
  if (!user) {
    return false
  }

  return committeeAddresses.has(user)
}