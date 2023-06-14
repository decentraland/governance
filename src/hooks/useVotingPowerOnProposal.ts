import { useQuery } from '@tanstack/react-query'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { SnapshotVote, StrategyOrder, VpDistribution } from '../clients/SnapshotGraphqlTypes'
import { ProposalAttributes } from '../entities/Proposal/types'
import { isSameAddress } from '../entities/Snapshot/utils'
import { MINIMUM_VP_REQUIRED_TO_VOTE } from '../entities/Votes/constants'
import { Vote } from '../entities/Votes/types'

import useVotingPowerDistribution from './useVotingPowerDistribution'

interface CurrentVPOnProposal {
  addressVp: number
  delegatedVp: number
}

const initialVotingPowerOnProposal: CurrentVPOnProposal = {
  addressVp: 0,
  delegatedVp: 0,
}

export default function useVotingPowerOnProposal(
  address: string | null,
  delegators: string[] | null,
  isLoadingDelegators: boolean,
  votes?: Record<string, Vote> | null,
  proposal?: ProposalAttributes | null
) {
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address, proposal?.snapshot_id)
  const { data, isLoading } = useQuery({
    queryKey: [`vpDistribution#${address}#${proposal?.snapshot_id}`],
    queryFn: async () => {
      if (!address || !proposal || isLoadingDelegators || isLoadingVpDistribution || !vpDistribution) {
        return initialVotingPowerOnProposal
      }
      const votes: SnapshotVote[] = await SnapshotGraphql.get().getProposalVotes(proposal.snapshot_id)
      const delegatedVp = getDelegatedVotingPowerOnProposal(vpDistribution, delegators, votes)
      const addressVp = vpDistribution.own || 0
      return { addressVp, delegatedVp }
    },
    staleTime: 3.6e6, // 1 hour
  })
  const vpOnProposal = data ?? initialVotingPowerOnProposal
  const totalVpOnProposal = vpOnProposal.addressVp + vpOnProposal.delegatedVp
  const hasEnoughToVote = totalVpOnProposal > MINIMUM_VP_REQUIRED_TO_VOTE && !isLoading
  return {
    totalVpOnProposal,
    ...vpOnProposal,
    hasEnoughToVote,
    isLoadingVp: isLoadingVpDistribution || isLoading,
  }
}

function getVoteDelegatableVp(vote: SnapshotVote) {
  if (!vote.vp_by_strategy) {
    throw new Error(`Missing vp by strategy info on vote ${vote}`)
  } else {
    return (
      vote.vp_by_strategy[StrategyOrder.Land] +
      vote.vp_by_strategy[StrategyOrder.Estate] +
      vote.vp_by_strategy[StrategyOrder.Mana] +
      vote.vp_by_strategy[StrategyOrder.Names] +
      vote.vp_by_strategy[StrategyOrder.L1Wearables] +
      vote.vp_by_strategy[StrategyOrder.WrappedMana] +
      vote.vp_by_strategy[StrategyOrder.Rental]
    )
  }
}

function getDelegatedVotingPowerOnProposal(
  vpDistribution: VpDistribution,
  delegators: string[] | null,
  votes: SnapshotVote[]
) {
  let delegatedVotingPower = vpDistribution.delegated
  if (votes && !!delegators) {
    for (const vote of votes) {
      if (delegators.find((delegator) => isSameAddress(delegator, vote.voter))) {
        const voterDelegatedVp = getVoteDelegatableVp(vote)
        delegatedVotingPower -= voterDelegatedVp
      }
    }
  }
  return delegatedVotingPower
}
