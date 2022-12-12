import API from 'decentraland-gatsby/dist/utils/api/API'

import { PoiType, ProposalStatus, ProposalType } from '../entities/Proposal/types'

const GATSBY_BASE_URL = process.env.GATSBY_BASE_URL || '/'

export function toProposalListPage(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return Math.max(1, value)
  } else if (typeof value === 'string') {
    const page = Number(value)
    return Number.isFinite(page) ? Math.max(1, page) : 1
  } else {
    return 1
  }
}

export type ProposalListPage = {
  page: string
}

export type ProposalsStatusFilter = {
  status: ProposalStatus
}

export type ProposalsTypeFilter = {
  type: ProposalType
}

export type ProposalsModal = {
  modal: 'new'
}

export function url(path = '/', query: Record<string, string> | URLSearchParams = {}) {
  return API.url(GATSBY_BASE_URL, path, query)
}

export default {
  home: () => url('/'),
  proposals: (
    options:
      | Partial<ProposalListPage & ProposalsStatusFilter & ProposalsTypeFilter & ProposalsModal>
      | URLSearchParams = {}
  ) => url('/proposals/', options),
  proposal: (proposal: string, options: { new?: 'true'; newUpdate?: 'true' } = {}) =>
    url('/proposal/', { id: proposal, ...options }),
  submit: (type?: ProposalType, options: { linked_proposal_id?: string; request?: PoiType } = {}) =>
    url(type ? `/submit/${String(type).replace('_', '-')}/` : '/submit/', options),
  submitUpdate: (options: { id?: string; proposalId: string }) => url('/submit/update', options),
  profile: (options: Partial<{ address: string }> = {}) => url('/profile/', options),
  transparency: () => url('/transparency/'),
  debug: () => url('/debug/'),
  welcome: () => url('/welcome/', {}),
  update: (id: string) => url('/update/', { id }),
  grants: () => url('/grants/', {}),
  edit: {
    update: (id: string) => url('edit/update/', { id }),
  },
}
