import useDelegatedVotingPower from './useDelegatedVotingPower'
import useDelegation from './useDelegation'
import useVotingPowerBalance from './useVotingPowerBalance'

export default function useVotingPowerInformation(address?: string | null) {
  const { votingPower, isLoadingVotingPower } = useVotingPowerBalance(address)
  const [delegation, delegationState] = useDelegation(address)
  const { scores, isLoadingScores, delegatedVotingPower } = useDelegatedVotingPower(delegation.delegatedFrom)

  return {
    votingPower,
    isLoadingVotingPower,
    delegation,
    delegationState,
    delegatedVotingPower,
    isLoadingScores,
    scores,
    ownVotingPower: votingPower - delegatedVotingPower,
  }
}
