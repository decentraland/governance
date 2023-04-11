import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

export default function usePreselectedProposal(proposalId: ProposalAttributes['id'] | null) {
  const [preselectedProposal] = useAsyncMemo(
    async () => {
      if (!proposalId) {
        return undefined
      }

      const proposal = await Governance.get().getProposal(proposalId)
      if (!proposal) {
        return undefined
      }

      return [
        {
          key: proposal.id,
          text: proposal.title,
          value: proposal.id,
        },
      ]
    },
    [],
    { initialValue: undefined }
  )

  return preselectedProposal
}
