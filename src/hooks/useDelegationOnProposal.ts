import { useQuery } from '@tanstack/react-query'

import { EMPTY_DELEGATION } from '../clients/SnapshotGraphqlTypes'
import { ProposalAttributes } from '../entities/Proposal/types'
import { getDelegations } from '../entities/Snapshot/utils'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export default function useDelegationOnProposal(proposal?: ProposalAttributes | null, address?: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: [`delegationsOnProposal#${address}#${proposal?.snapshot_proposal.snapshot}`],
    queryFn: async () => {
      return await getDelegations(address, proposal?.snapshot_proposal.snapshot)
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    delegationResult: data ?? EMPTY_DELEGATION,
    isDelegationResultLoading: isLoading,
  }
}
