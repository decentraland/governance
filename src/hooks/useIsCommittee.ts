import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../api/Governance'

export default function useIsCommittee(address?: string | null) {
  const [committeeAddresses] = useAsyncMemo(() => Governance.get().getCommittee(), [])
  const isCommittee = useMemo(
    () => !!(address && committeeAddresses && committeeAddresses.includes(address)),
    [address, committeeAddresses]
  )
  return { isCommittee }
}
