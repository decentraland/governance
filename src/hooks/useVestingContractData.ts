import { useQuery } from '@tanstack/react-query'

import { getVestingContractData } from '../clients/VestingData'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useVestingContractData(vestingAddress: string) {
  const { data: vestingData, isLoading } = useQuery({
    queryKey: [`vestingContractData#${vestingAddress}`],
    queryFn: () => getVestingContractData(vestingAddress),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return { vestingData, isLoading }
}

export default useVestingContractData
