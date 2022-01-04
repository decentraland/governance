import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo';
import { getVotingPower } from '../entities/Snapshot/utils'

export default function useVotingPowerBalance(address?: string | null, space?: string | null) {
  return useAsyncMemo(async () => {
    return getVotingPower(address, space)
  }, [address, space], { initialValue: 0, callWithTruthyDeps: true })
}
