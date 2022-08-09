import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Snapshot } from '../api/Snapshot'

import useProposals from './useProposals'

export default function useProposalsByParticipatingVP(start: Date, end: Date) {
  const [snapshotProposals] = useAsyncMemo(async () => {
    return await Snapshot.get().getPendingProposals(start, end, ['id'], 5)
  })
  const snapshotIds = useMemo(() => snapshotProposals?.map((item) => item.id).join(','), [snapshotProposals])
  const { proposals } = useProposals({ snapshotIds, load: !!snapshotIds })

  return {
    proposals,
  }
}
