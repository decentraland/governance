import { useMemo } from 'react'
import { useLocation } from '@reach/router'
import { toProposalType, toProposalStatus, ProposalType, ProposalStatus } from '../entities/Proposal/types'
import { toProposalListPage } from '../modules/locations'

export type SearchParams = {
  type: ProposalType | undefined
  status: ProposalStatus | undefined,
  search: string,
  searching: boolean,
  timeFrame: string,
  order: 'ASC' | 'DESC' | undefined,
  page: number
}

export function useSearchParams(): SearchParams {
  const location = useLocation()
  return useMemo(() => {
    const params = new URLSearchParams(location.search)
    const type = toProposalType(params.get('type')) ?? undefined
    const status = toProposalStatus(params.get('status')) ?? undefined
    const search = params.get('search') || ''
    const timeFrame = params.get('timeFrame') || ''
    const order = params.get('order') ? (params.get('order') === 'ASC' ? 'ASC' : 'DESC') : undefined
    const searching = !!search && search.length > 0
    const page = toProposalListPage(params.get('page')) ?? undefined

    return { type, status, search, searching, timeFrame, order, page }
  }, [location.search])
}
