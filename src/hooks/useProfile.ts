import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'

export default function useProfile(address?: string | null) {
  const [profile, state] = useAsyncMemo(
    async () => (address ? profiles.load(address) : null),
    [address],
    {
      callWithTruthyDeps: true,
    }
  )

  return {
    profile,
    state,
  }
}