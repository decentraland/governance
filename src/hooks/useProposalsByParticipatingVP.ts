import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import compact from 'lodash/compact'
import orderBy from 'lodash/orderBy'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'

import useProposals from './useProposals'

export default function useProposalsByParticipatingVP(start: Date, end: Date) {
  const { data: snapshotProposals, isLoading: isLoadingSnapshotProposals } = useQuery({
    queryKey: [`snapshotProposals#${start}#${end}`],
    queryFn: async () => {
      const pendingProposals = await SnapshotGraphql.get().getPendingProposals(start, end, ['id'], 5)
      return orderBy(pendingProposals, ['scores_total'], ['desc'])
    },
    staleTime: 3.6e6, // 1 hour
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
    isLoadingProposals: isLoadingSnapshotProposals || isLoadingProposals,
  }
}
