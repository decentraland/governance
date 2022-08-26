import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'
import { SnapshotGraphqlClient } from '../api/SnapshotGraphqlClient'
import { calculateMatch } from '../entities/Snapshot/utils'

export default function useVotesMatch(userAccount: string | null, otherAccount: string | null) {
  const [userVotes, userVotesState] = useAsyncMemo(
    async () => (userAccount ? SnapshotGraphqlClient.get().getAddressVotes(userAccount) : Promise.resolve(null)),
    [userAccount]
  )
  const [otherAccountVotes, otherAccountVotesState] = useAsyncMemo(
    async () => (otherAccount ? Governance.get().getAddressVotes(otherAccount) : Promise.resolve(null)),
    [otherAccount]
  )

  return {
    userVotes,
    otherAccountVotes,
    matchResult: calculateMatch(userVotes, otherAccountVotes),
    votesInformationLoading: userVotesState.loading || otherAccountVotesState.loading,
  }
}
