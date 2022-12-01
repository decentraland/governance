import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { CoauthorAttributes, CoauthorStatus } from '../entities/Coauthor/types'
import { GrantAttributes, ProposalAttributes } from '../entities/Proposal/types'

function useCoAuthorsByProposal(proposal: ProposalAttributes | GrantAttributes | null) {
  const [account] = useAuthContext()
  const [allCoauthors] = useAsyncMemo(() => Governance.get().getCoAuthorsByProposal(proposal!.id), [proposal], {
    initialValue: [] as CoauthorAttributes[],
    callWithTruthyDeps: true,
  })
  return useMemo(() => {
    if (proposal && proposal.user.toLowerCase() === account?.toLowerCase()) {
      return allCoauthors
    }

    return allCoauthors.filter(
      (coauthor) =>
        coauthor.status === CoauthorStatus.APPROVED || coauthor.address.toLowerCase() === account?.toLowerCase()
    )
  }, [allCoauthors, account, proposal])
}

export default useCoAuthorsByProposal
