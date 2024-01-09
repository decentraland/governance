import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'

import { ONE_DAY_MS } from './constants'

function useCoreUnitsBadges() {
  const { data, isLoading } = useQuery({
    queryKey: ['core-units-badges'],
    queryFn: () => Governance.get().getCoreUnitsBadges(),
    staleTime: ONE_DAY_MS,
  })

  return { coreUnitsBadges: data, isLoadingCoreUnitsBadges: isLoading }
}

export default useCoreUnitsBadges
