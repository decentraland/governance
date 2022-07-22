import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'

export default function useIsDebugAddress(address?: string | null) {
  const [debugAddresses] = useAsyncMemo(() => Governance.get().getDebugAddresses(), [])
  const isDebugAddress = useMemo(
    () => !!(address && debugAddresses && debugAddresses.includes(address)),
    [address, debugAddresses]
  )
  return { isDebugAddress }
}
