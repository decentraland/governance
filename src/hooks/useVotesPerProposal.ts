import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphqlClient, SnapshotProposal } from '../api/SnapshotGraphqlClient'
import { groupProposalsByMonth, median } from '../entities/Snapshot/utils'

export default function useVotesPerProposal(start: Date, end: Date) {
  const [proposals, state] = useAsyncMemo(
    async () => {
      return await SnapshotGraphqlClient.get().getProposals(start, end, ['created', 'votes'])
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
