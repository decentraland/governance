import useDelegation from './useDelegation'
import useVotingPowerBalanceList from './useVotingPowerBalanceList'
import useVotingPowerDistribution from './useVotingPowerDistribution'

export default function useVotingPowerInformation(address?: string | null) {
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)
  const [delegation, delegationState] = useDelegation(address)
  const { votingPower: scores, isLoadingVotingPower: isLoadingScores } = useVotingPowerBalanceList(
    delegation.delegatedFrom.map((d) => d.delegator)
  )

  return {
    vpDistribution,
    isLoadingVpDistribution,
    delegation,
    delegationState,
    isLoadingScores,
    scores,
  }
}
