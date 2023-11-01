import { AccountType } from '../entities/User/types'

import useIsProfileValidated from './useIsProfileValidated'

function useIsProfileValidatedOnDiscord(address: string | null) {
  const { isProfileValidated, validationChecked } = useIsProfileValidated(address, [AccountType.Discord])

  return isProfileValidated && validationChecked
}

export default useIsProfileValidatedOnDiscord
