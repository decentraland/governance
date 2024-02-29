import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { ProposalAttributes } from '../entities/Proposal/types'

import useDelegationOnProposal from './useDelegationOnProposal'
import useVotingPowerOnProposal from './useVotingPowerOnProposal'

const REASON_THRESHOLD = 50000

function useVoteReason(proposal: ProposalAttributes | null) {
  const [account] = useAuthContext()
  const { delegationResult, isDelegationResultLoading } = useDelegationOnProposal(proposal, account)
  const delegators: string[] = useMemo(
    () => delegationResult.delegatedFrom.map((delegator) => delegator.delegator),
    [delegationResult.delegatedFrom]
  )

  const { totalVpOnProposal, hasEnoughToVote, isLoadingVp } = useVotingPowerOnProposal(
    account,
    delegators,
    isDelegationResultLoading,
    proposal
  )

  return {
    isLoading: isDelegationResultLoading || isLoadingVp,
    shouldGiveReason: hasEnoughToVote && totalVpOnProposal > REASON_THRESHOLD,
    totalVpOnProposal,
  }
}

export default useVoteReason
