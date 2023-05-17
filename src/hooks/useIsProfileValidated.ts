import { useState } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'

function useIsProfileValidated(address: string | null) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileValidated] = useAsyncMemo(
    async () => {
      setIsLoading(true)
      let isValidated = false
      if (address) {
        isValidated = await Governance.get().isProfileValidated(address)
      }
      setIsLoading(false)
      return isValidated
    },
    [address],
    {
      initialValue: false,
      callWithTruthyDeps: true,
    }
  )

  return [isProfileValidated, isLoading] as const
}

export default useIsProfileValidated
