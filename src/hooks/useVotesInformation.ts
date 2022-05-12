import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'
import { Snapshot } from '../api/Snapshot'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import { MatchResult, calculateMatch } from '../entities/Snapshot/utils'


export default function useVotesInformation(userAccount: string | null, otherAccount: string | null) {
  const [userVotes, userVotesState] = useAsyncMemo(
    async () => (userAccount ? Snapshot.get().getAddressVotes(SNAPSHOT_SPACE, userAccount) : Promise.resolve(null)),
    [userAccount],
  )
  const [otherAccountVotes, otherAccountVotesState] = useAsyncMemo(
    async () => (otherAccount ? Governance.get().getAddressVotes(otherAccount) : Promise.resolve(null)),
    [otherAccount]
  )

  let matchResult: MatchResult | null = null
  if (userVotes && otherAccountVotes) {
    matchResult = calculateMatch(userVotes, otherAccountVotes)
  }

  return {
    userVotes,
    otherAccountVotes,
    matchResult,
    votesInformationLoading: userVotesState.loading || otherAccountVotesState.loading
  }
}
