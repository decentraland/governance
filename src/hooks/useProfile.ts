import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles, { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'

export default function useProfile(address?: string | null) {
  const [profile, profileState] = useAsyncMemo<Profile>(() => profiles.load(address || ''), [address])
  const hasDclProfile = !!profile && !profile.isDefaultProfile

  return { profile, profileState, hasDclProfile }
}
