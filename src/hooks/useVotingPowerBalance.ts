import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { getVotingPower } from '../entities/Votes/utils'

export default function useVotingPowerBalance(address?: string | null) {
  const [votingPower, state] = useAsyncMemo(
    async () => {
      if (!address) {
        return await Promise.resolve(null)
      }
      return await getVotingPower(address)
    },
    [address],
    { callWithTruthyDeps: true }
  )
  return {
    votingPower: votingPower?.totalVp || 0,
    ownVotingPower: votingPower?.ownVp || 0,
    delegatedVotingPower: votingPower?.delegatedVp || 0,
    isLoadingVotingPower: state.loading,
  }
}
