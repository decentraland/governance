import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { SnapshotProposal } from '../clients/SnapshotGraphqlTypes'
import { groupProposalsByMonth, median } from '../entities/Snapshot/utils'

export default function useVotesPerProposal(start: Date, end: Date) {
  const [proposals, state] = useAsyncMemo(
    async () => {
      return await SnapshotGraphql.get().getProposals(start, end, ['created', 'votes'])
    },
    [],
    { initialValue: [] as Partial<SnapshotProposal>[], callWithTruthyDeps: true }
  )

  const votesPerProposal = useMemo(() => {
    const proposalsGroup = groupProposalsByMonth(proposals, 'votes')
    return Object.entries(proposalsGroup).reduce(
      (acc, [key, vps]) => ({ ...acc, [key]: Math.round(median(vps)) }),
      {} as Record<string, number>
    )
  }, [proposals])
  return {
    votesPerProposal,
    isLoadingVotesPerProposal: state.loading,
  }
}
