import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { SnapshotProposal } from '../clients/SnapshotGraphqlTypes'
import { groupProposalsByMonth, median } from '../entities/Snapshot/utils'

export default function useParticipatingVP(start: Date, end: Date) {
  const [proposals, state] = useAsyncMemo(
    async () => {
      return await SnapshotGraphql.get().getProposals(start, end, ['created', 'scores_total'])
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
