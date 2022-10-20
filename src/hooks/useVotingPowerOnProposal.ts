import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { SnapshotGraphql } from '../clients/SnapshotGraphql'
import { SnapshotVote, StrategyOrder, VpDistribution } from '../clients/SnapshotGraphqlTypes'
import { ProposalAttributes } from '../entities/Proposal/types'
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
  const [vpOnProposal, vpOnProposalState] = useAsyncMemo(
    async () => {
      if (!address || !proposal || isLoadingDelegators || isLoadingVpDistribution || !vpDistribution) {
        return initialVotingPowerOnProposal
      }
      const votes: SnapshotVote[] = await SnapshotGraphql.get().getProposalVotes(proposal.snapshot_id)
      const delegatedVp = getDelegatedVotingPowerOnProposal(vpDistribution, delegators, votes)
      const addressVp = vpDistribution.own || 0
      return { addressVp, delegatedVp }
    },
    [votes, address, proposal, delegators, isLoadingDelegators],
    { initialValue: initialVotingPowerOnProposal }
  )
  const totalVpOnProposal = vpOnProposal.addressVp + vpOnProposal.delegatedVp
  const hasEnoughToVote = totalVpOnProposal > MINIMUM_VP_REQUIRED_TO_VOTE && !vpOnProposalState.loading
  return { totalVpOnProposal, ...vpOnProposal, hasEnoughToVote, vpOnProposalState }
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
      vote.vp_by_strategy[StrategyOrder.WrappedMana]
    )
  }
}

function getDelegatedVotingPowerOnProposal(
  vpDistribution: VpDistribution,
  delegators: string[] | null,
  votes: SnapshotVote[]
) {
  let delegatedVotingPower = 0
  if (votes && !!delegators && vpDistribution) {
    delegatedVotingPower = vpDistribution.delegated
    for (const vote of votes) {
      if (delegators.find((delegator) => delegator === vote.voter)) {
        //TODO CHECKsum addresses?
        const voterDelegatedVp = getVoteDelegatableVp(vote)
        delegatedVotingPower -= voterDelegatedVp
      }
    }
  }
  return delegatedVotingPower
}
