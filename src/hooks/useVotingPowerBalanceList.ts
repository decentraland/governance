import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useVotingPowerBalanceList(addresses: string[]) {
  const { data: votingPower, isLoading: isLoadingVotingPower } = useQuery({
    queryKey: [`votingPower#${JSON.stringify(addresses)}`],
    queryFn: async () => {
      if (addresses.length < 1) return {}
      return await Governance.get().getScores(addresses)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    votingPower: votingPower ?? {},
    isLoadingVotingPower,
  }
}
