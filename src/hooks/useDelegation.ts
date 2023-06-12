import { useQuery } from '@tanstack/react-query'

import { EMPTY_DELEGATION } from '../clients/SnapshotGraphqlTypes'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { getDelegations } from '../entities/Snapshot/utils'

export default function useDelegation(address?: string | null) {
  const { data: delegationResult, isLoading: isDelegationResultLoading } = useQuery({
    queryKey: [`delegations#${SNAPSHOT_SPACE}#${address}`],
    queryFn: async () => {
      if (!address) return EMPTY_DELEGATION
      return await getDelegations(address)
    },
    staleTime: 3.6e6, // 1 hour
  })
  return {
    delegationResult: delegationResult ?? EMPTY_DELEGATION,
    isDelegationResultLoading,
  }
}
