import { useMemo } from 'react'

import useAddressesVotesTotals, { VoteHistory } from './useAddressesVotesTotals'
import usePickedBy from './usePickedBy'
import useVotingPowerBalanceList from './useVotingPowerBalanceList'

export type Delegate = VoteHistory & {
  address: string
  pickedBy: number
  totalVP: number
}

function useDelegatesInfo(addresses: string[]): Delegate[] {
  addresses = addresses.map((addr) => addr.toLowerCase())

  const { votingPower } = useVotingPowerBalanceList(addresses)
  const { pickedByResults } = usePickedBy(addresses)
  const { addressesVotesTotals } = useAddressesVotesTotals(addresses)

  return useMemo(
    () =>
      pickedByResults.map((delegate) => ({
        ...delegate,
        ...addressesVotesTotals[delegate.address.toLowerCase()],
        totalVP: votingPower[delegate.address]?.totalVp || 0,
      })),
    [pickedByResults, votingPower]
  )
}

export default useDelegatesInfo
