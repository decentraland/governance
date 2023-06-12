import { useQuery } from '@tanstack/react-query'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'

export default function useProfile(address?: string | null) {
  const fetchProfile = async () => {
    if (!address) return null
    return profiles.load(address)
  }
  const { data: profile } = useQuery({
    queryKey: [`user-${address?.toLowerCase()}-profile`],
    queryFn: () => fetchProfile(),
    staleTime: 3.6e6, // 1 hour
  })

  const hasDclProfile = !!profile && !profile.isDefaultProfile
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0
  const displayableAddress = profileHasName ? profile.name : address

  return { profile, hasDclProfile, displayableAddress }
}
