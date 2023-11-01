import { AccountType } from '../entities/User/types'

import useIsProfileValidated from './useIsProfileValidated'

function useIsProfileValidatedOnForum(address: string | null) {
  const { isProfileValidated, validationChecked } = useIsProfileValidated(address, [AccountType.Forum])

  return isProfileValidated && validationChecked
}

export default useIsProfileValidatedOnForum
