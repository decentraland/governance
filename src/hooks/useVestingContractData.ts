import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useVestingContractData(vestingAddresses: string[]) {
  const { data: vestingData, isLoading } = useQuery({
    queryKey: [`vestingContractData#${vestingAddresses.join(',')}`],
    queryFn: () => Governance.get().getVestingContractData(vestingAddresses),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return { vestingData, isLoading }
}

export default useVestingContractData
