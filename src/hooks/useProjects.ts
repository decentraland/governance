import { useQuery } from '@tanstack/react-query'

import { GetProjectsFilter, GetProposalsFilter, Governance } from '../clients/Governance'
import { MAX_PROPOSAL_LIMIT } from '../entities/Proposal/utils'

import { DEFAULT_QUERY_STALE_TIME } from './constants'

export type UseProposalsFilter = Omit<GetProjectsFilter, 'subscribed' | 'limit' | 'offset'> & {
  subscribed: string | boolean
  page: number
  itemsPerPage: number
  load: boolean
}

export default function useProjects(filter: Partial<UseProposalsFilter> = {}) {
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: [`projects#${JSON.stringify(filter)}`],
    queryFn: async () => {
      if (filter.load === false) {
        return {
          ok: true,
          total: 0,
          data: [],
        }
      }
      const limit = filter.itemsPerPage ?? MAX_PROPOSAL_LIMIT
      const offset = ((filter.page ?? 1) - 1) * limit
      const params: Partial<GetProjectsFilter> = { limit, offset }
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
      if (filter.timeFrame) {
        params.timeFrame = filter.timeFrame
      }
      if (filter.timeFrameKey) {
        params.timeFrameKey = filter.timeFrameKey
      }
      if (filter.order) {
        params.order = filter.order
      }

      return Governance.get().getProjects({ ...params, limit, offset })
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  console.log('p', projects)

  return {
    projects,
    isLoadingProjects,
  }
}
