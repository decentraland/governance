import useDelegation from './useDelegation'
import useVotingPowerBalanceList from './useVotingPowerBalanceList'
import useVotingPowerDistribution from './useVotingPowerDistribution'

export default function useVotingPowerInformation(address?: string | null) {
  const { vpDistribution, isLoadingVpDistribution } = useVotingPowerDistribution(address)
  const { delegation, isDelegationLoading } = useDelegation(address)
  const delegatorsToAddress = delegation?.delegatedFrom.map((d) => d.delegator)
  const { votingPower: scores, isLoadingVotingPower: isLoadingScores } = useVotingPowerBalanceList(delegatorsToAddress)

  return {
    vpDistribution,
    isLoadingVpDistribution,
    delegation,
    isDelegationLoading,
    isLoadingScores,
    scores,
  }
}
