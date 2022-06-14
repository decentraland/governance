import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'

export default function useIsAdmin(address?: string | null) {
  const [adminAddresses] = useAsyncMemo(() => Governance.get().getAdminAddresses(), [])
  const isAdmin = useMemo(
    () => !!(address && adminAddresses && adminAddresses.includes(address)),
    [address, adminAddresses]
  )
  return { isAdmin }
}
