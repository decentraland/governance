import useDelegation from './useDelegation'
import useVotingPowerBalance from './useVotingPowerBalance'
import useVotingPowerBalanceList from './useVotingPowerBalanceList'

export default function useVotingPowerInformation(address?: string | null) {
  const { votingPower, delegatedVotingPower, ownVotingPower, isLoadingVotingPower } = useVotingPowerBalance(address)
  const [delegation, delegationState] = useDelegation(address)
  const { votingPower: scores, isLoadingVotingPower: isLoadingScores } = useVotingPowerBalanceList(
    delegation.delegatedFrom.map((d) => d.delegator)
  )

  return {
    votingPower,
    isLoadingVotingPower,
    delegation,
    delegationState,
    delegatedVotingPower,
    isLoadingScores,
    scores,
    ownVotingPower,
  }
}
