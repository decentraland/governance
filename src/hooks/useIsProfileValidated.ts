import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import isBoolean from 'lodash/isBoolean'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../clients/Governance'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

function useIsProfileValidated(address: string | null) {
  const { data: isProfileValidated } = useQuery({
    queryKey: [`isProfileValidated#${address}`],
    queryFn: async () => {
      if (address && isEthereumAddress(address)) {
        return await Governance.get().isProfileValidated(address)
      }
      return null
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const validationChecked = useMemo(() => isBoolean(isProfileValidated), [isProfileValidated])

  return { isProfileValidated: !!isProfileValidated, validationChecked }
}

export default useIsProfileValidated
