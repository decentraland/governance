import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { createDefaultAvatar, getProfile } from '../utils/Catalyst'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProfile(address?: string | null) {
  const fetchProfile = async () => {
    if (!address || !isEthereumAddress(address)) return null

    try {
      const profile = await getProfile(address)
      return { profile: profile || createDefaultAvatar(address), isDefaultProfile: !profile }
    } catch (error) {
      return null
    }
  }
  const { data, isLoading: isLoadingProfile } = useQuery({
    queryKey: [`userProfile#${address?.toLowerCase()}`],
    queryFn: () => fetchProfile(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const { profile, isDefaultProfile } = data || {}

  const hasDclProfile = !!profile && !isDefaultProfile
  const profileHasName = hasDclProfile && !!profile.name && profile.name.length > 0 && profile.hasClaimedName
  const displayableAddress = profileHasName ? profile.name : address

  return { profile, hasDclProfile, displayableAddress, isLoadingProfile, profileHasName }
}
