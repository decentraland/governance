import { useMemo } from 'react'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'

export default function useIsDAOCommittee(address?: string | null) {
  const [committeeAddresses] = useAsyncMemo(() => Governance.get().getCommittee(), [])
  const isDAOCommittee = useMemo(
    () => !!(address && committeeAddresses && committeeAddresses.includes(address)),
    [address, committeeAddresses]
  )
  return { isDAOCommittee }
}
