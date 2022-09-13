import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { CoauthorAttributes, CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalAttributes } from '../entities/Proposal/types'

export function useCoAuthorsByProposal(proposal: ProposalAttributes) {
  const [account] = useAuthContext()
  const [allCoauthors] = useAsyncMemo(() => Governance.get().getCoAuthorsByProposal(proposal.id), [proposal.id], {
    initialValue: [] as CoauthorAttributes[],
  })
  return useMemo(() => {
    if (proposal.user.toLowerCase() === account?.toLowerCase()) {
      return allCoauthors
    }

    return allCoauthors.filter(
      (coauthor) =>
        coauthor.status === CoauthorStatus.APPROVED || coauthor.address.toLowerCase() === account?.toLowerCase()
    )
  }, [allCoauthors, account, proposal.user])
}
