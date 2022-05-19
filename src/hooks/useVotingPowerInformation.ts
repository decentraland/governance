import useDelegation from './useDelegation'
import useVotingPowerBalance from './useVotingPowerBalance'
import useVotingPowerBalanceList from './useVotingPowerBalanceList'

export default function useVotingPowerInformation(address?: string | null) {
  const { votingPower, isLoadingVotingPower } = useVotingPowerBalance(address)
  const [delegation, delegationState] = useDelegation(address)
  const { votingPower: scores, isLoadingVotingPower: isLoadingScores } = useVotingPowerBalanceList(delegation.delegatedFrom.map(d => d.delegator))

  return {
    votingPower: votingPower?.totalVp || 0,
    isLoadingVotingPower,
    delegation,
    delegationState,
    delegatedVotingPower: votingPower?.delegatedVp || 0,
    isLoadingScores,
    scores,
    ownVotingPower: votingPower?.ownVp || 0
  }
}
