import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { REASON_THRESHOLD } from '../constants'
import { ProposalAttributes } from '../entities/Proposal/types'

import useDelegationOnProposal from './useDelegationOnProposal'
import useVotingPowerOnProposal from './useVotingPowerOnProposal'

function useVoteReason(proposal: ProposalAttributes | null) {
  const [account] = useAuthContext()
  const { isDelegationResultLoading, delegators } = useDelegationOnProposal(proposal, account)

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
