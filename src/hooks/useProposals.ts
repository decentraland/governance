import useAsyncMemo from "decentraland-gatsby/dist/hooks/useAsyncMemo"
import { GetProposalsFilter, Governance } from "../api/Governance"
import { MAX_PROPOSAL_LIMIT } from "../entities/Proposal/utils"

export type UseProposalsFilter = Omit<GetProposalsFilter, 'subscribed' | 'limit' | 'offset'> & {
  subscribed: string | boolean,
  page: number
  itemsPerPage: number
  load: boolean
}

export default function useProposals(filter: Partial<UseProposalsFilter> = {}) {
  return useAsyncMemo(
    async () => {
      if (filter.load === false) {
        return {
          ok: true,
          total: 0,
          data: []
        }
      }
      const limit = filter.itemsPerPage ?? MAX_PROPOSAL_LIMIT
      const offset = ((filter.page ?? 1) - 1) * limit
      const params: Partial<GetProposalsFilter> = { limit, offset }
      if(filter.status) { params.status = filter.status }
      if(filter.type) { params.type = filter.type }
      if(filter.user) { params.user = filter.user }
      if(filter.subscribed) { params.subscribed = !!filter.subscribed }
      return Governance.get().getProposals({ ...params, limit, offset })
    },
    [
      filter.status,
      filter.type,
      filter.user,
      filter.subscribed,
      filter.page,
      filter.itemsPerPage,
      filter.load,
    ]
  )
}