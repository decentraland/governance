import chalk from 'chalk'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import env from '../../config'

export const DAO_COUNCIL_ADDRESSES = (env('DAO_COUNCIL_ADDRESSES', '') || '')
  .split(',')
  .filter(isEthereumAddress)
  .map((address) => address.toLowerCase())

const daoCouncilAddresses = new Set(DAO_COUNCIL_ADDRESSES)

daoCouncilAddresses.forEach((address) => console.log('dao council address:', chalk.magenta(address)))

export default function isDAOCouncil(user?: string | null | undefined) {
  if (!user) {
    return false
  }

  return daoCouncilAddresses.has(user.toLowerCase())
}
