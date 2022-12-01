import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { ProposalAttributes } from '../entities/Proposal/types'

export default function useIsProposalOwner(proposal?: ProposalAttributes | null) {
  const [account] = useAuthContext()
  const isOwner = useMemo(() => !!(proposal && account && proposal.user === account), [proposal, account])
  return { isOwner }
}
