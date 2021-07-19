import { ProposalStatus, ProposalType } from "../entities/Proposal/types";
import API from 'decentraland-gatsby/dist/utils/api/API'

const GATSBY_BASE_URL = process.env.GATSBY_BASE_URL || '/'
export const WELCOME_STORE_KEY: string = 'org.decentraland.governance.welcome'
export const WELCOME_STORE_VERSION: string = '1'

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

export enum ProposalListView {
  Enacted = 'enacted',
  Onboarding = 'onboarding',
}

export function toProposalListView(list: string | null | undefined): ProposalListView | null {
  switch(list) {
    case ProposalListView.Enacted:
    case ProposalListView.Onboarding:
      return list
    default:
      return null
  }
}

export type ProposalListPage = {
  page: string
}

export type ProposalListViewFilter = {
  view: ProposalListView
}

export type ProposalsStatusFilter = {
  status: ProposalStatus
}

export type ProposalsTypeFilter = {
  type: ProposalType,
}

export enum ProposalActivityList {
  MyProposals = 'proposals',
  Watchlist = 'watchlist',
}

export function toProposalActivityList(list: string | null | undefined): ProposalActivityList | null {
  switch(list) {
    case ProposalActivityList.MyProposals:
    case ProposalActivityList.Watchlist:
      return list
    default:
      return null
  }
}

export type ProposalActivityFilter = {
  list: ProposalActivityList,
}

export type ProposalsModal = {
  modal: 'new'
}

export function url(path: string = '/', query: Record<string, string> | URLSearchParams = {}) {
  return API.url(GATSBY_BASE_URL, path, query)
}

export default {
  proposals: (options: Partial<ProposalListPage & ProposalListViewFilter & ProposalsStatusFilter & ProposalsTypeFilter & ProposalsModal> | URLSearchParams = {}) => url('/', options),
  proposal: (proposal: string) => url(`/proposal/`, { id: proposal }),
  activity: (options: Partial<ProposalsStatusFilter & ProposalActivityFilter> | URLSearchParams = {}) => url(`/activity/`, options),
  submit: (type?: ProposalType) => url(type ? `/submit/${String(type).replace('_','-')}/` : '/submit/', {}),
  balance: (options: Partial<{ address: string }> = {}) => url(`/balance/`, options),
  welcome: () => url(`/welcome/`, {}),
}