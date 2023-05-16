import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'

function useIsProfileValidated(address: string | null) {
  const [isProfileValidated] = useAsyncMemo(
    async () => {
      if (address) {
        return await Governance.get().isProfileValidated(address)
      }
      return false
    },
    [address],
    {
      initialValue: false,
    }
  )

  return isProfileValidated
}

export default useIsProfileValidated
