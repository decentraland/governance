import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

const EMPTY_VALUE = {
  proposal: null,
  selectOption: [
    {
      key: '',
      text: '',
      value: '',
    },
  ],
}

export default function usePreselectedProposal(proposalId: ProposalAttributes['id'] | null) {
  const [preselectedProposal] = useAsyncMemo(
    async () => {
      if (!proposalId) {
        return EMPTY_VALUE
      }

      const proposal = await Governance.get().getProposal(proposalId)
      if (!proposal) {
        return EMPTY_VALUE
      }

      return {
        proposal,
        selectOption: [
          {
            key: proposal.id,
            text: proposal.title,
            value: proposal.id,
          },
        ],
      }
    },
    [],
    { initialValue: EMPTY_VALUE }
  )

  return preselectedProposal
}
