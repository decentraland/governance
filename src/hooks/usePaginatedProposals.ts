import { useEffect, useState } from 'react'

import { ProposalAttributes } from '../entities/Proposal/types'

import useProposals, { UseProposalsFilter } from './useProposals'

const DEFAULT_ITEMS_PER_PAGE = 5

export default function usePaginatedProposals(filter: Partial<UseProposalsFilter> = {}) {
  const [page, setPage] = useState(1)
  const [paginatedProposals, setPaginatedProposals] = useState<ProposalAttributes[]>([])
  const { proposals, isLoadingProposals } = useProposals({
    itemsPerPage: filter.itemsPerPage || DEFAULT_ITEMS_PER_PAGE,
    ...filter,
    page,
  })

  useEffect(() => {
    if (proposals) {
      setPaginatedProposals((prev) => [...prev, ...proposals.data])
    }
  }, [proposals])

  return {
    proposals: paginatedProposals,
    isLoadingProposals,
    hasMoreProposals: paginatedProposals.length !== proposals?.total,
    loadMore: () => setPage((prev) => prev + 1),
  }
}
