import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { getProfiles } from '../utils/Catalyst'
import { DclProfile } from '../utils/Catalyst/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useDclProfiles(addresses: (string | null | undefined)[]): {
  profiles: DclProfile[]
  isLoadingProfiles: boolean
} {
  const fetchProfiles = async () => {
    const validAddresses = addresses.filter((address) => isEthereumAddress(address || '')) as string[]
    try {
      return await getProfiles(validAddresses)
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const { data, isLoading: isLoadingProfiles } = useQuery({
    queryKey: [`userProfiles#${addresses.join(',')}`],
    queryFn: () => fetchProfiles(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return { profiles: data || [], isLoadingProfiles }
}
