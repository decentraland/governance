import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql, getQueryTimestamp } from '../clients/SnapshotGraphql'
import { SnapshotProposal, SnapshotVote } from '../clients/SnapshotGraphqlTypes'
import { calculateMatch, getChecksumAddress, outcomeMatch } from '../entities/Snapshot/utils'
import { getPercentage } from '../helpers'

<<<<<<< HEAD
function sortAddressesVotes(votes: SnapshotVote[], userAddress: string | null) {
  const addressVotes: SnapshotVote[] = []
  const userVotes: SnapshotVote[] = []
  votes.forEach((vote) => {
    if (userAddress && getChecksumAddress(vote.voter!) === getChecksumAddress(userAddress!)) {
=======
function sortAddressesVotes(votes: SnapshotVote[], comparingAgainstUser: boolean, userAddress: string | null) {
  const addressVotes: SnapshotVote[] = []
  const userVotes: SnapshotVote[] = []
  votes.forEach((vote) => {
    if (comparingAgainstUser && getChecksumAddress(vote.voter!) === getChecksumAddress(userAddress!)) {
>>>>>>> 64c4c74 (chore: useVotingStats)
      userVotes.push(vote)
    } else {
      addressVotes.push(vote)
    }
  })
  return { addressVotes, userVotes }
}

<<<<<<< HEAD
=======
function getOutcomeMatchPercentage(addressVotes: SnapshotVote[]) {
  return (addressVotes && addressVotes.length > 0 && outcomeMatch(addressVotes).outcomeMatch) || 0
}

>>>>>>> 64c4c74 (chore: useVotingStats)
function getParticipation(
  last30DaysProposals: Partial<SnapshotProposal>[],
  addressVotes: SnapshotVote[],
  aMonthAgo: Date
) {
<<<<<<< HEAD
  const proposalsVotedLast30Days = addressVotes.filter(
    (vote) => vote.created > getQueryTimestamp(aMonthAgo.getTime())
  ).length
  const participationPercentage = getPercentage(proposalsVotedLast30Days, last30DaysProposals.length, 0)
  return { participationTotal: proposalsVotedLast30Days, participationPercentage }
}

export default function useVotingStats(address: string, userAddress: string | null) {
=======
  const totalProposalsLast30Days = last30DaysProposals.length
  const proposalsVotedLast30Days = addressVotes.filter(
    (vote) => vote.created > getQueryTimestamp(aMonthAgo.getTime())
  ).length
  const participationPercentage = getPercentage(proposalsVotedLast30Days, totalProposalsLast30Days, 0)
  return { participationTotal: totalProposalsLast30Days, participationPercentage }
}

export default function useVotingStats(address: string) {
  const [userAddress] = useAuthContext()
  const comparingAgainstUser = !!userAddress && userAddress.length > 0 && !(userAddress === address)
>>>>>>> 64c4c74 (chore: useVotingStats)
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
<<<<<<< HEAD
  const { addressVotes, userVotes } = useMemo(() => sortAddressesVotes(votes, userAddress), [votes, userAddress])

  const { participationTotal, participationPercentage } = useMemo(
    () => getParticipation(last30DaysProposals, addressVotes, aMonthAgo),
    [addressVotes]
  )
  const matchResult = useMemo(() => calculateMatch(addressVotes, userVotes), [addressVotes, userVotes])
=======
  const { addressVotes, userVotes } = sortAddressesVotes(votes, comparingAgainstUser, userAddress)

  const { participationTotal, participationPercentage } = getParticipation(last30DaysProposals, addressVotes, aMonthAgo)
  const matchResult = calculateMatch(addressVotes, userVotes)
>>>>>>> 64c4c74 (chore: useVotingStats)

  return {
    participationPercentage,
    participationTotal,
<<<<<<< HEAD
    personalMatchPercentage: userAddress ? matchResult.percentage : 100,
    outcomeMatchPercentage: outcomeMatch(addressVotes).outcomeMatch,
=======
    personalMatchPercentage: comparingAgainstUser ? matchResult.percentage : 100,
    outcomeMatchPercentage: getOutcomeMatchPercentage(addressVotes),
>>>>>>> 64c4c74 (chore: useVotingStats)
    isLoading: proposalsState.loading || votesState.loading,
  }
}
