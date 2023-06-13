import { useQuery } from '@tanstack/react-query'

import { getScores } from '../entities/Votes/utils'

export default function useVotingPowerBalanceList(addresses: string[]) {
  const { data: votingPower, isLoading: isLoadingVotingPower } = useQuery({
    queryKey: [`votingPower#${JSON.stringify(addresses)}`],
    queryFn: async () => {
      if (addresses.length < 1) return {}
      return await getScores(addresses)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return {
    votingPower: votingPower ?? {},
    isLoadingVotingPower,
  }
}
