import { useQuery } from '@tanstack/react-query'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProfile(address?: string | null) {
  const fetchProfile = async () => {
    if (!address) return null
    return profiles.load(address)
  }
  const { data: profile } = useQuery({
    queryKey: [`userProfile#${address?.toLowerCase()}`],
    queryFn: () => fetchProfile(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const hasDclProfile = !!profile && !profile.isDefaultProfile
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0
  const displayableAddress = profileHasName ? profile.name : address

  return { profile, hasDclProfile, displayableAddress }
}
