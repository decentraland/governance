import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql, getQueryTimestamp } from '../clients/SnapshotGraphql'
import { SnapshotProposal, SnapshotVote } from '../clients/SnapshotGraphqlTypes'
import { calculateMatch, getChecksumAddress, outcomeMatch } from '../entities/Snapshot/utils'
import { getPercentage } from '../helpers'

function sortAddressesVotes(votes: SnapshotVote[], userAddress: string | null) {
  const addressVotes: SnapshotVote[] = []
  const userVotes: SnapshotVote[] = []
  votes.forEach((vote) => {
    if (userAddress && getChecksumAddress(vote.voter!) === getChecksumAddress(userAddress!)) {
      userVotes.push(vote)
    } else {
      addressVotes.push(vote)
    }
  })
  return { addressVotes, userVotes }
}

function getOutcomeMatchPercentage(addressVotes: SnapshotVote[]) {
  return (addressVotes && addressVotes.length > 0 && outcomeMatch(addressVotes).outcomeMatch) || 0
}

function getParticipation(
  last30DaysProposals: Partial<SnapshotProposal>[],
  addressVotes: SnapshotVote[],
  aMonthAgo: Date
) {
  const proposalsVotedLast30Days = addressVotes.filter(
    (vote) => vote.created > getQueryTimestamp(aMonthAgo.getTime())
  ).length
  const participationPercentage = getPercentage(proposalsVotedLast30Days, last30DaysProposals.length, 0)
  return { participationTotal: proposalsVotedLast30Days, participationPercentage }
}

export default function useVotingStats(address: string, userAddress: string | null) {
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
      if (userAddress) addresses.push(userAddress)
      return await SnapshotGraphql.get().getAddressesVotes(addresses)
    },
    [address],
    { initialValue: [] as SnapshotVote[], callWithTruthyDeps: true }
  )
  const { addressVotes, userVotes } = sortAddressesVotes(votes, userAddress)

  const { participationTotal, participationPercentage } = getParticipation(last30DaysProposals, addressVotes, aMonthAgo)
  const matchResult = calculateMatch(addressVotes, userVotes)

  return {
    participationPercentage,
    participationTotal,
    personalMatchPercentage: userAddress ? matchResult.percentage : 100,
    outcomeMatchPercentage: getOutcomeMatchPercentage(addressVotes),
    isLoading: proposalsState.loading || votesState.loading,
  }
}
