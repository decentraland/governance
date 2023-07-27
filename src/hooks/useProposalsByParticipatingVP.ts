import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import compact from 'lodash/compact'
import orderBy from 'lodash/orderBy'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'
import useProposals from './useProposals'

export default function useProposalsByParticipatingVP(start: Date, end: Date) {
  const { data: snapshotProposals, isLoading: isLoadingSnapshotProposals } = useQuery({
    queryKey: [`snapshotProposals#${start}#${end}`],
    queryFn: async () => {
      const pendingProposals = await Governance.get().getPendingProposals({
        start,
        end,
        fields: ['id', 'scores_total'],
        limit: 5,
      })
      return orderBy(pendingProposals, ['scores_total'], ['desc'])
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
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
