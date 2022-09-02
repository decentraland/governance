import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { EMPTY_DELEGATION } from '../clients/SnapshotGraphql'
import { ProposalAttributes } from '../entities/Proposal/types'
import { getDelegationsOnProposal } from '../entities/Snapshot/utils'

export default function useDelegationOnProposal(proposal?: ProposalAttributes | null, address?: string | null) {
  return useAsyncMemo(
    async () => {
      return await getDelegationsOnProposal(address, proposal)
    },
    [address, proposal],
    { initialValue: EMPTY_DELEGATION, callWithTruthyDeps: true }
  )
}
