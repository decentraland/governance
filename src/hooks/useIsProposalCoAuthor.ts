import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { CoauthorStatus } from '../entities/Coauthor/types'
import { GrantAttributes, ProposalAttributes } from '../entities/Proposal/types'

import useCoAuthorsByProposal from './useCoAuthorsByProposal'

export default function useIsProposalCoAuthor(proposal: ProposalAttributes | GrantAttributes | null) {
  const [account] = useAuthContext()
  const coauthorsByProposal = useCoAuthorsByProposal(proposal)
  const isCoauthor = useMemo(
    () =>
      !!coauthorsByProposal.find(
        (coauthor) =>
          coauthor.address?.toLowerCase() === account?.toLowerCase() && coauthor.status === CoauthorStatus.APPROVED
      ),
    [coauthorsByProposal, account]
  )
  return { isCoauthor }
}
