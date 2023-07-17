import { useQuery } from '@tanstack/react-query'

import { ErrorClient } from '../clients/ErrorClient'
import { createDefaultAvatar, getProfile } from '../utils/Catalyst'
import { ErrorCategory } from '../utils/errorCategories'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProfile(address?: string | null) {
  const fetchProfile = async () => {
    if (!address) return null

    try {
      const profile = await getProfile(address)
      return { profile: profile || createDefaultAvatar(address), isDefaultProfile: !profile }
    } catch (error) {
      ErrorClient.report('Error getting profile', { error, address, category: ErrorCategory.ProfileError })
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
  const profileHasName = hasDclProfile && !!profile.name && profile.name.length > 0
  const displayableAddress = profileHasName ? profile.name : address

  return { profile, hasDclProfile, displayableAddress, isLoadingProfile }
}
