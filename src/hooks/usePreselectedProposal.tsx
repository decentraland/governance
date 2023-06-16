import { useQuery } from '@tanstack/react-query'

import { Governance } from '../clients/Governance'
import { ProposalAttributes } from '../entities/Proposal/types'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

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
    queryKey: [`preselectedProposal#${proposalId}`],
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
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return preselectedProposal
}
