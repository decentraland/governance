import { useQuery } from '@tanstack/react-query'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { VpDistribution } from '../clients/SnapshotGraphqlTypes'

export const EMPTY_DISTRIBUTION: VpDistribution = {
  total: 0,
  own: 0,
  wMana: 0,
  land: 0,
  estate: 0,
  mana: 0,
  names: 0,
  delegated: 0,
  l1Wearables: 0,
  rental: 0,
}

export default function useVotingPowerDistribution(address?: string | null, proposalSnapshotId?: string) {
  const { data: vpDistribution, isLoading } = useQuery({
    queryKey: [`vpDistribution#${address}#${proposalSnapshotId}`],
    queryFn: async () => {
      if (!address) return EMPTY_DISTRIBUTION
      return await SnapshotGraphql.get().getVpDistribution(address, proposalSnapshotId)
    },
    staleTime: 3.6e6, // 1 hour
  })

  return { vpDistribution: vpDistribution ?? EMPTY_DISTRIBUTION, isLoadingVpDistribution: isLoading }
}
