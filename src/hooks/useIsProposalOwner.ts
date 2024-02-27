import { useMemo } from 'react'

import { ProposalAttributes } from '../entities/Proposal/types'
import { isSameAddress } from '../entities/Snapshot/utils'
import { useAuthContext } from '../front/context/AuthProvider'

export default function useIsProposalOwner(proposal?: ProposalAttributes | null) {
  const [account] = useAuthContext()
  const isOwner = useMemo(() => isSameAddress(proposal?.user, account), [proposal, account])
  return { isOwner }
}
