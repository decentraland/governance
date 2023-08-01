import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { groupProposalsByMonth, median } from '../entities/Snapshot/utils'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useVotesPerProposal(start: Date, end: Date) {
  const { data: proposals, isLoading } = useQuery({
    queryKey: [`proposals#${start}#${end}`],
    queryFn: async () => {
      return await Governance.get().getSnapshotProposals(start, end, ['created', 'votes'])
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
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
