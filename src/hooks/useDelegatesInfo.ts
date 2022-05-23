import { useMemo } from 'react'

import usePickedBy from './usePickedBy'
import useVotingPowerBalanceList from './useVotingPowerBalanceList'

export type Delegate = {
  address: string
  pickedBy: number
  totalVP: number
}

function useDelegatesInfo(addresses: string[]): Delegate[] {
  addresses = addresses.map((addr) => addr.toLowerCase())

  const { votingPower } = useVotingPowerBalanceList(addresses)
  const { pickedByResults } = usePickedBy(addresses)

  return useMemo(
    () => pickedByResults.map((delegate) => ({ ...delegate, totalVP: votingPower[delegate.address]?.totalVp || 0 })),
    [pickedByResults, votingPower]
  )
}

export default useDelegatesInfo
