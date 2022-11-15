import { GOVERNANCE_API } from '../../constants'

export function profileUrl(userAddress: string) {
  const params = new URLSearchParams({ address: userAddress })
  const target = new URL(GOVERNANCE_API)
  target.pathname = '/profile/'
  target.search = '?' + params.toString()
  return target.toString()
}
