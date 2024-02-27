import { useMemo } from 'react'

import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes } from '../entities/Proposal/types'
import { isSameAddress } from '../entities/Snapshot/utils'
import { useAuthContext } from '../front/context/AuthProvider'

import useCoAuthorsByProposal from './useCoAuthorsByProposal'

export default function useIsProposalCoAuthor(proposal: ProposalAttributes | null) {
  const [account] = useAuthContext()
  const coauthorsByProposal = useCoAuthorsByProposal(proposal)
  const isCoauthor = useMemo(
    () =>
      !!coauthorsByProposal.find(
        (coauthor) => isSameAddress(coauthor.address, account) && coauthor.status === CoauthorStatus.APPROVED
      ),
    [coauthorsByProposal, account]
  )
  return { isCoauthor }
}
