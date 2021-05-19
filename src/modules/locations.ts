import { ProposalStatus, ProposalType } from "../entities/Proposal/types";

export const WELCOME_STORE_KEY: string = 'org.decentraland.governance.welcome'
export const WELCOME_STORE_VERSION: string = '1'

export enum ProposalListView {
  Enacted = 'enacted'
}

export function toProposalListView(list: string | null | undefined): ProposalListView | null {
  switch(list) {
    case ProposalListView.Enacted:
      return list
    default:
      return null
  }
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
  const params = new URLSearchParams(query).toString()

  return path + (params ? '?' : '') + params
}

export default {
  proposals: (options: Partial<ProposalListViewFilter & ProposalsStatusFilter & ProposalsTypeFilter & ProposalsModal> | URLSearchParams = {}) => url('/', options),
  proposal: (proposal: string) => url(`/proposal/`, { id: proposal }),
  activity: (options: Partial<ProposalsStatusFilter & ProposalActivityFilter> | URLSearchParams = {}) => url(`/activity/`, options),
  submit: (type: ProposalType) => url(`/submit/${String(type).replace('_','-')}/`, {}),
  balance: () => url(`/balance/`, {}),
  welcome: () => url(`/welcome/`, {}),
}