import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { getQueryTimestamp } from '../clients/SnapshotGraphql'
import { SnapshotProposal, SnapshotVote } from '../clients/SnapshotTypes'
import { calculateMatch, isSameAddress, outcomeMatch } from '../entities/Snapshot/utils'
import { getFormattedPercentage } from '../helpers'
import Time from '../utils/date/Time'
import { getAMonthAgo } from '../utils/date/date'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function sortAddressesVotes(votes: SnapshotVote[], userAddress?: string | null) {
  const addressVotes: SnapshotVote[] = []
  const userVotes: SnapshotVote[] = []
  votes.forEach((vote) => {
    if (userAddress && isSameAddress(vote.voter, userAddress)) {
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

export default function useVotingStats(address: string, userAddress?: string | null) {
  const now = useMemo(() => Time().toDate(), [])
  const aMonthAgo = useMemo(() => getAMonthAgo(now), [now])

  const { data: last30DaysProposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: [`last30DaysProposals#${aMonthAgo.getTime()}`],
    queryFn: async () => {
      return await Governance.get().getSnapshotProposals(aMonthAgo, now, ['id', 'choices', 'scores'])
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const { data: votes, isLoading: isLoadingVotes } = useQuery({
    queryKey: [`votes#${address}${userAddress ? `-${userAddress}` : ''}`],
    queryFn: async () => {
      const addresses = [address]
      if (userAddress) addresses.push(userAddress)
      return await Governance.get().getVotesByAddresses(addresses)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
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
