import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Snapshot, SnapshotProposal } from '../api/Snapshot'
import { groupProposalsByMonth, median } from '../entities/Snapshot/utils'

export default function useParticipatingVP(start: Date, end: Date) {
  const [proposals, state] = useAsyncMemo(
    async () => {
      return await Snapshot.get().getProposals(start, end, ['created', 'scores_total'])
    },
    [],
    { initialValue: [] as Partial<SnapshotProposal>[], callWithTruthyDeps: true }
  )

  const participatingVP = useMemo(() => {
    const proposalsGroup = groupProposalsByMonth(proposals, 'scores_total')
    return Object.entries(proposalsGroup).reduce(
      (acc, [key, vps]) => ({ ...acc, [key]: Math.round(median(vps)) }),
      {} as Record<string, number>
    )
  }, [proposals])
  return {
    participatingVP,
    isLoadingParticipatingVP: state.loading,
  }
}
