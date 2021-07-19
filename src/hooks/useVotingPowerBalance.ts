import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo";
import snapshot from "@snapshot-labs/snapshot.js";
import { Snapshot } from "../api/Snapshot";

export default function useVotingPowerBalance(address?: string | null, space?: string | null) {
  return useAsyncMemo(async () => {

    if (!address || !space) {
      return 0
    }

    const info = await Snapshot.get().getSpace(space)
    const vp: Record<string, number>[] = await snapshot.utils.getScores(space, info.strategies, info.network, null as any,[ address ])
    return vp.reduce((total, current) => {
      return total + Object.values(current).reduce((total, current) => total + (current | 0), 0)
    }, 0)
  }, [ address, space ], { initialValue: 0, callWithTruthyDeps: true})
}