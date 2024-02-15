import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { getProfile } from '../utils/Catalyst'
import { DclProfile } from '../utils/Catalyst/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useDclProfile(address?: string | null) {
  const fetchProfile = async () => {
    if (!address || !isEthereumAddress(address)) return null

    try {
      return await getProfile(address)
    } catch (error) {
      return null
    }
  }
  const { data: profile, isLoading: isLoadingDclProfile } = useQuery({
    queryKey: [`userProfile#${address?.toLowerCase()}`],
    queryFn: () => fetchProfile(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    profile: profile || ({} as DclProfile),
    isLoadingDclProfile,
  }
}
