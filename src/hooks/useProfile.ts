import { useQuery } from '@tanstack/react-query'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'

export default function useProfile(address?: string | null) {
  const { data: profile } = useQuery({
    queryKey: [`user-${address}-profile`],
    queryFn: () => (address ? profiles.load(address) : null),
  })

  const hasDclProfile = !!profile && !profile.isDefaultProfile
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0
  const displayableAddress = profileHasName ? profile.name : address

  return { profile, hasDclProfile, displayableAddress }
}
