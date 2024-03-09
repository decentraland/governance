import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { EMPTY_DELEGATION } from '../clients/SnapshotTypes'
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

  const delegators =
    useMemo(() => data?.delegatedFrom.map((delegator) => delegator.delegator), [data?.delegatedFrom]) ?? []

  return {
    delegationResult: data ?? EMPTY_DELEGATION,
    isDelegationResultLoading: isLoading,
    delegators,
  }
}
