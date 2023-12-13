import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { createDefaultCatalystProfile, getProfiles } from '../utils/Catalyst'
import { CatalystProfileStatus } from '../utils/Catalyst/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useProfiles(addresses: (string | null | undefined)[]): {
  profiles: CatalystProfileStatus[]
  isLoadingProfiles: boolean
} {
  const fetchProfiles = async () => {
    const validAddresses = addresses.filter((address) => isEthereumAddress(address || '')) as string[]
    let validAddressesProfiles: CatalystProfileStatus[] = []

    try {
      const profiles = await getProfiles(validAddresses)
      validAddressesProfiles = profiles.map<CatalystProfileStatus>((profile, idx) => ({
        profile: profile || createDefaultCatalystProfile(validAddresses[idx]),
        isDefaultProfile: !profile,
      }))
    } catch (error) {
      console.error(error)
      validAddressesProfiles = validAddresses.map<CatalystProfileStatus>((address) => ({
        profile: createDefaultCatalystProfile(address),
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
