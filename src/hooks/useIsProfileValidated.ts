import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { Governance } from '../clients/Governance'

function useIsProfileValidated(address: string | null) {
  const [isProfileValidated] = useAsyncMemo(
    async () => {
      if (address && isEthereumAddress(address)) {
        return await Governance.get().isProfileValidated(address)
      }
      return null
    },
    [address],
    {
      initialValue: null,
    }
  )

  const validationChecked = isProfileValidated !== null

  return { isProfileValidated: !!isProfileValidated, validationChecked }
}

export default useIsProfileValidated
