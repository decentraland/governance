import { useQuery } from '@tanstack/react-query'
import isBoolean from 'lodash/isBoolean'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../clients/Governance'
import { AccountType } from '../entities/User/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

const ALL_ACCOUNTS = [AccountType.Forum, AccountType.Discord]

function useIsProfileValidated(address: string | null, accounts = ALL_ACCOUNTS) {
  const { data: isProfileValidated } = useQuery({
    queryKey: [`isProfileValidated#${address}#${accounts.join(',')}}`],
    queryFn: async () => {
      if (address && isEthereumAddress(address)) {
        return await Governance.get().isProfileValidated(address, accounts)
      }
      return null
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const validationChecked = isBoolean(isProfileValidated)

  return { isProfileValidated: !!isProfileValidated, validationChecked }
}

export default useIsProfileValidated
