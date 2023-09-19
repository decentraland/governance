import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { VpDistribution } from '../clients/SnapshotTypes'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

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
      return await Governance.get().getVpDistribution(address, proposalSnapshotId)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return { vpDistribution: vpDistribution ?? EMPTY_DISTRIBUTION, isLoadingVpDistribution: isLoading }
}
