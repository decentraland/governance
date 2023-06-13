import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { groupProposalsByMonth, median } from '../entities/Snapshot/utils'

export default function useVotesPerProposal(start: Date, end: Date) {
  const { data: proposals, isLoading } = useQuery({
    queryKey: [`proposals#${start}#${end}`],
    queryFn: async () => {
      return await SnapshotGraphql.get().getProposals(start, end, ['created', 'votes'])
    },
    staleTime: 3.6e6, // 1 hour
  })

  const votesPerProposal = useMemo(() => {
    const proposalsGroup = groupProposalsByMonth(proposals ?? [], 'votes')
    return Object.entries(proposalsGroup).reduce(
      (acc, [key, vps]) => ({ ...acc, [key]: Math.round(median(vps)) }),
      {} as Record<string, number>
    )
  }, [proposals])
  return {
    votesPerProposal,
    isLoadingVotesPerProposal: isLoading,
  }
}
