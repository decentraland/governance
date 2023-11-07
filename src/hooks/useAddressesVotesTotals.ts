import { useQuery } from '@tanstack/react-query'
import max from 'lodash/max'

import { Governance } from '../clients/Governance'

import { TWENTY_MINUTES_MS } from './constants'

export type VoteHistory = { lastVoted: number; timesVoted: number }

const fetchVotes = async (addresses: string[]) => {
  const addressesVotesByDate = await Governance.get().getAddressesVotes(addresses)
  const aggregatedVotes: Record<string, VoteHistory> = {}
  addressesVotesByDate.map((voteByDate) => {
    const voter = voteByDate.voter.toLowerCase()
    if (aggregatedVotes[voter]) {
      aggregatedVotes[voter].timesVoted += 1
      aggregatedVotes[voter].lastVoted = max([aggregatedVotes[voter].lastVoted, voteByDate.created]) || 0
    } else {
      aggregatedVotes[voter] = {
        lastVoted: voteByDate.created,
        timesVoted: 1,
      }
    }
  })
  return aggregatedVotes
}

export default function useAddressesVotesTotals(addresses: string[]) {
  const { data: addressesVotesTotals, isLoading } = useQuery({
    queryKey: [`votesTotals#${addresses.join('-')}`],
    queryFn: () => fetchVotes(addresses),
    staleTime: TWENTY_MINUTES_MS,
  })
  return {
    addressesVotesTotals: addressesVotesTotals ?? {},
    isLoadingAddressesVotesTotals: isLoading,
  }
}
