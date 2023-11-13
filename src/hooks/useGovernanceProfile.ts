import { useQuery } from '@tanstack/react-query'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { ErrorClient } from '../clients/ErrorClient'
import { Governance } from '../clients/Governance'
import { ErrorCategory } from '../utils/errorCategories'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useGovernanceProfile(address?: string | null) {
  const { data, isLoading: isLoadingGovernanceProfile } = useQuery({
    queryKey: [`userGovernanceProfile`, address],
    queryFn: async () => {
      if (!address || !isEthereumAddress(address)) return null

      try {
        return await Governance.get().getUserProfile(address)
      } catch (error: any) {
        if (error.statusCode !== RequestError.NotFound) {
          ErrorClient.report('Error getting governance profile', { error, address, category: ErrorCategory.Profile })
        }
        return null
      }
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
    enabled: !!address,
  })

  return { profile: data, isProfileValidated: !!data?.forum_id, isLoadingGovernanceProfile }
}
