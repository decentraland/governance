import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo";
import { Snapshot } from "../api/Snapshot";

export default function useVotingPowerBalance(address?: string | null, space?: string | null) {
  return useAsyncMemo(async () => {
    return await Snapshot.get().getVotingPower(address, space)
  }, [ address, space ], { initialValue: 0, callWithTruthyDeps: true})
}
