import { useQuery } from '@tanstack/react-query'

import { GetProposalsFilter, Governance } from '../clients/Governance'
import { MAX_PROPOSAL_LIMIT } from '../entities/Proposal/utils'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export function getProposalsQueryFn(
  filter: Partial<UseProposalsFilter> = {},
  defaultItemsPerPage = MAX_PROPOSAL_LIMIT
) {
  return async ({ pageParam = 0 }) => {
    if (filter.load === false) {
      return {
        ok: true,
        total: 0,
        data: [],
      }
    }
    const limit = filter.itemsPerPage ?? defaultItemsPerPage
    const offset = ((filter.page ?? 1) - 1 || pageParam) * limit
    const params: Partial<GetProposalsFilter> = { limit, offset }
    if (filter.status) {
      params.status = filter.status
    }
    if (filter.type) {
      params.type = filter.type
    }
    if (filter.subtype) {
      params.subtype = filter.subtype
    }
    if (filter.user) {
      params.user = filter.user
    }
    if (filter.subscribed) {
      params.subscribed = !!filter.subscribed
    }
    if (filter.search) {
      params.search = filter.search
    }
    if (filter.timeFrame) {
      params.timeFrame = filter.timeFrame
    }
    if (filter.timeFrameKey) {
      params.timeFrameKey = filter.timeFrameKey
    }
    if (filter.order) {
      params.order = filter.order
    }
    if (filter.coauthor) {
      params.coauthor = filter.coauthor
    }
    if (filter.snapshotIds) {
      params.snapshotIds = filter.snapshotIds
    }
    if (filter.linkedProposalId) {
      params.linkedProposalId = filter.linkedProposalId
    }

    return Governance.get().getProposals({ ...params, limit, offset })
  }
}

export type UseProposalsFilter = Omit<GetProposalsFilter, 'subscribed' | 'limit' | 'offset'> & {
  subscribed: string | boolean
  page: number
  itemsPerPage: number
  load: boolean
}

export default function useProposals(filter: Partial<UseProposalsFilter> = {}) {
  const { data: proposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: [`proposals#${JSON.stringify(filter)}`],
    queryFn: getProposalsQueryFn(filter),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  return {
    proposals,
    isLoadingProposals,
  }
}
