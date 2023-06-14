import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { SnapshotGraphql, getQueryTimestamp } from '../clients/SnapshotGraphql'
import { SnapshotProposal, SnapshotVote } from '../clients/SnapshotGraphqlTypes'
import { calculateMatch, getChecksumAddress, outcomeMatch } from '../entities/Snapshot/utils'
import { getFormattedPercentage } from '../helpers'

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

function getParticipation(
  last30DaysProposals: Partial<SnapshotProposal>[],
  addressVotes: SnapshotVote[],
  aMonthAgo: Date
) {
  const queryTimestamp = getQueryTimestamp(aMonthAgo.getTime())
  const proposalsVotedInTheLast30Days: Set<string> = new Set()
  addressVotes.forEach((vote) => {
    const voteMatchesAProposal = last30DaysProposals.find((proposal) => proposal.id === vote.proposal?.id)
    const voteMatchesTimeframe = vote.created > queryTimestamp
    if (voteMatchesTimeframe && voteMatchesAProposal && vote.proposal?.id) {
      proposalsVotedInTheLast30Days.add(vote.proposal?.id)
    }
  })

  const participationPercentage = getFormattedPercentage(
    proposalsVotedInTheLast30Days.size,
    last30DaysProposals.length,
    0
  )
  return { participationTotal: proposalsVotedInTheLast30Days.size, participationPercentage }
}

export default function useVotingStats(address: string, userAddress: string | null) {
  const now = useMemo(() => new Date(), [])
  const aMonthAgo = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, now.getDay()), [now])

  const { data: last30DaysProposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: [`last30DaysProposals#${aMonthAgo.getTime()}`],
    queryFn: async () => {
      return await SnapshotGraphql.get().getProposals(aMonthAgo, now, ['id', 'choices', 'scores'])
    },
    staleTime: 3.6e6, // 1 hour
  })

  const { data: votes, isLoading: isLoadingVotes } = useQuery({
    queryKey: [`votes#${address}${userAddress ? `-${userAddress}` : ''}`],
    queryFn: async () => {
      const addresses = [address]
      if (userAddress) addresses.push(userAddress)
      return await SnapshotGraphql.get().getAddressesVotes(addresses)
    },
    staleTime: 3.6e6, // 1 hour
  })

  const { addressVotes, userVotes } = useMemo(() => sortAddressesVotes(votes ?? [], userAddress), [votes, userAddress])

  const { participationTotal, participationPercentage } = useMemo(
    () => getParticipation(last30DaysProposals ?? [], addressVotes, aMonthAgo),
    [last30DaysProposals, addressVotes, aMonthAgo]
  )

  const matchResult = useMemo(() => calculateMatch(addressVotes, userVotes), [addressVotes, userVotes])

  return {
    participationPercentage,
    participationTotal,
    personalMatchPercentage: userAddress ? matchResult.percentage : 100,
    outcomeMatchPercentage: outcomeMatch(addressVotes).outcomeMatch,
    isLoading: isLoadingProposals || isLoadingVotes,
  }
}
