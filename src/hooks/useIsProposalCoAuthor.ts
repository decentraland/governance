import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes } from '../entities/Proposal/types'

import useCoAuthorsByProposal from './useCoAuthorsByProposal'

export default function useIsProposalCoAuthor(proposal: ProposalAttributes | null) {
  const [account] = useAuthContext()
  const isCoAuthor = !!useCoAuthorsByProposal(proposal).find(
    (coauthor) =>
      coauthor.address?.toLowerCase() === account?.toLowerCase() && coauthor.status === CoauthorStatus.APPROVED
  )
  return { isCoAuthor }
}
