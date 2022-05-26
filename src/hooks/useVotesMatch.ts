import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'
import { Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { calculateMatch } from '../entities/Snapshot/utils'

export default function useVotesMatch(userAccount: string | null, otherAccount: string | null) {
  const [userVotes, userVotesState] = useAsyncMemo(
    async () => (userAccount ? Snapshot.get().getAddressVotes(SNAPSHOT_SPACE, userAccount) : Promise.resolve(null)),
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
