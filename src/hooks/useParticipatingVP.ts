import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { SnapshotProposal } from '../clients/SnapshotGraphqlTypes'
import { groupProposalsByMonth, median } from '../entities/Snapshot/utils'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useParticipatingVP(start: Date, end: Date) {
  const { data: proposals, isLoading: isLoadingProposals } = useQuery<Partial<SnapshotProposal>[], Error>({
    queryKey: [`proposals#${start.toISOString()}#${end.toISOString()}`],
    queryFn: async () => {
      return await SnapshotGraphql.get().getProposals(start, end, ['created', 'scores_total'])
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const participatingVP = useMemo(() => {
    const proposalsGroup = groupProposalsByMonth(proposals ?? [], 'scores_total')
    return Object.entries(proposalsGroup).reduce(
      (acc, [key, vps]) => ({ ...acc, [key]: Math.round(median(vps)) }),
      {} as Record<string, number>
    )
  }, [proposals])

  return {
    participatingVP,
    isLoadingParticipatingVP: isLoadingProposals,
  }
}
