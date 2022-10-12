import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles, { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'

export default function useProfile(address?: string | null) {
  const [profile, profileState] = useAsyncMemo<Profile>(() => profiles.load(address || ''), [address])
  const hasDclProfile = !!profile && !profile.isDefaultProfile
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0
  const displayableAddress = profileHasName ? profile.name : address

  return { profile, profileState, hasDclProfile, displayableAddress }
}
