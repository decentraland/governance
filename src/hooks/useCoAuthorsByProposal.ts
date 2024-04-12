import { useMemo } from 'react'

import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes } from '../entities/Proposal/types'
import { useAuthContext } from '../front/context/AuthProvider'

import useCoauthors from './useCoauthors'

function useCoAuthorsByProposal(proposal: ProposalAttributes | null) {
  const [account] = useAuthContext()
  const allCoauthors = useCoauthors(proposal?.id)
  return useMemo(() => {
    if (proposal && proposal.user.toLowerCase() === account?.toLowerCase()) {
      return allCoauthors
    }

    return allCoauthors
      ? allCoauthors.filter(
          (coauthor) =>
            coauthor.status === CoauthorStatus.APPROVED || coauthor.address.toLowerCase() === account?.toLowerCase()
        )
      : []
  }, [allCoauthors, account, proposal])
}

export default useCoAuthorsByProposal
