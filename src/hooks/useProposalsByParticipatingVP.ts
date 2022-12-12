import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import compact from 'lodash/compact'
import orderBy from 'lodash/orderBy'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'

import useProposals from './useProposals'

export default function useProposalsByParticipatingVP(start: Date, end: Date) {
  const [snapshotProposals, snapshotProposalsState] = useAsyncMemo(async () => {
    const pendingProposals = await SnapshotGraphql.get().getPendingProposals(start, end, ['id'], 5)
    return orderBy(pendingProposals, ['scores_total'], ['desc'])
  })
  const snapshotIds = useMemo(() => snapshotProposals?.map((item) => item.id).join(','), [snapshotProposals])
  const { proposals, isLoadingProposals } = useProposals({ snapshotIds, load: !!snapshotIds })

  const orderedProposals = useMemo(
    () =>
      compact(
        snapshotProposals?.map((snapshotProposal) =>
          proposals?.data.find((item) => item.snapshot_id === snapshotProposal.id)
        )
      ),
    [proposals?.data, snapshotProposals]
  )

  return {
    proposals: orderedProposals,
    isLoadingProposals: snapshotProposalsState.loading || isLoadingProposals,
  }
}
