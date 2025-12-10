import { DAO_COUNCIL_ADDRESSES } from '../../constants'

const daoCouncilAddresses = new Set(DAO_COUNCIL_ADDRESSES)

export default function isDAOCouncil(user?: string | null | undefined) {
  if (!user) {
    return false
  }

  return daoCouncilAddresses.has(user.toLowerCase())
}
