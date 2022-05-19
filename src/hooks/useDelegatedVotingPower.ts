import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Delegation, Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'

export default function useDelegatedVotingPower(delegatedFrom: Delegation[]) {
  const [space] = useAsyncMemo(() => Snapshot.get().getSpace(SNAPSHOT_SPACE), [SNAPSHOT_SPACE])

  const [scores, scoresState] = useAsyncMemo(
    () =>
      Snapshot.get().getLatestScores(
        space!,
        delegatedFrom.map((delegation) => delegation.delegator)
      ),
    [space, delegatedFrom],
    { callWithTruthyDeps: true }
  )

  const delegatedVotingPower = useMemo(
    () => Object.values(scores || {}).reduce((total, current) => total + current, 0),
    [scores]
  )

  return {
    scores,
    delegatedVotingPower,
    isLoadingScores: scoresState.loading,
  }
}
