import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../clients/Governance'

function useIsProfileValidated(address: string | null) {
  const { data: isProfileValidated } = useQuery({
    queryKey: [`isProfileValidated#${address}`],
    queryFn: async () => {
      if (address && isEthereumAddress(address)) {
        return await Governance.get().isProfileValidated(address)
      }
      return null
    },
    staleTime: 3.6e6, // 1 hour
  })

  const validationChecked = useMemo(() => {
    return isProfileValidated !== null
  }, [isProfileValidated])

  return { isProfileValidated: !!isProfileValidated, validationChecked }
}

export default useIsProfileValidated
