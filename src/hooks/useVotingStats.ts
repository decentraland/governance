import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { SnapshotProposal, SnapshotVote } from '../clients/SnapshotGraphqlTypes'
import { calculateMatch, getChecksumAddress, outcomeMatch } from '../entities/Snapshot/utils'
import { getPercentage } from '../helpers'

export default function useVotingStats(address: string) {
  const [userAddress] = useAuthContext()
  const comparingAgainstUser = userAddress && !(userAddress === address)

  const now = new Date()
  const aMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDay())
  const [last30DaysProposals, proposalsState] = useAsyncMemo(
    async () => {
      return await SnapshotGraphql.get().getProposals(aMonthAgo, now, ['id', 'choices', 'scores'])
    },
    [],
    { initialValue: [] as Partial<SnapshotProposal>[], callWithTruthyDeps: true }
  )

  const [votes, votesState] = useAsyncMemo(
    async () => {
      const addresses = [address]
      if (comparingAgainstUser) addresses.push(userAddress)
      return await SnapshotGraphql.get().getAddressesVotes(addresses)
    },
    [address],
    { initialValue: [] as SnapshotVote[], callWithTruthyDeps: true }
  )

  const addressVotes: SnapshotVote[] = []
  const userVotes: SnapshotVote[] = []
  votes.forEach((vote) => {
    if (comparingAgainstUser && getChecksumAddress(vote.voter!) === getChecksumAddress(userAddress)) {
      userVotes.push(vote)
    } else {
      addressVotes.push(vote)
    }
  })

  const totalProposals = last30DaysProposals.length
  const matchResult = calculateMatch(addressVotes, userVotes)
  const outcomeMatchPercentage = addressVotes && addressVotes.length > 0 && outcomeMatch(addressVotes).outcomeMatch

  return {
    participationPercentage: getPercentage(addressVotes.length, totalProposals, 0),
    participationTotal: totalProposals,
    personalMatchPercentage: comparingAgainstUser ? matchResult.percentage : 100,
    outcomeMatchPercentage: 0 || outcomeMatchPercentage,
    isLoading: proposalsState.loading || votesState.loading,
  }
}
