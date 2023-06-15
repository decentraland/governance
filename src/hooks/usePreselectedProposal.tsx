import { useQuery } from '@tanstack/react-query'

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
  const { data: preselectedProposal } = useQuery({
    queryKey: [`preselected-proposal#${proposalId}`],
    queryFn: async () => {
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
    staleTime: 3.6e6, // 1 hour
  })

  return preselectedProposal
}
