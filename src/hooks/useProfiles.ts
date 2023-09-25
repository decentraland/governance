import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { createDefaultAvatar, getProfiles } from '../utils/Catalyst'
import { Avatar } from '../utils/Catalyst/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

type Profile = {
  profile: Avatar
  isDefaultProfile: boolean
}

export default function useProfiles(addresses: (string | null | undefined)[]): {
  profiles: Profile[]
  isLoadingProfiles: boolean
} {
  const fetchProfiles = async () => {
    const validAddresses = addresses.filter((address) => isEthereumAddress(address || '')) as string[]
    let validAddressesProfiles: Profile[] = []

    try {
      const profiles = await getProfiles(validAddresses)
      validAddressesProfiles = profiles.map<Profile>((profile, idx) => ({
        profile: profile || createDefaultAvatar(validAddresses[idx]),
        isDefaultProfile: !profile,
      }))
    } catch (error) {
      console.error(error)
      validAddressesProfiles = validAddresses.map<Profile>((address) => ({
        profile: createDefaultAvatar(address),
        isDefaultProfile: true,
      }))
    }

    return { profiles: validAddressesProfiles }
  }

  const { data, isLoading: isLoadingProfiles } = useQuery({
    queryKey: [`userProfiles#${addresses.join(',')}`],
    queryFn: () => fetchProfiles(),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const { profiles } = data || {}

  return { profiles: profiles || [], isLoadingProfiles }
}
