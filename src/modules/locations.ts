import { ProposalStatus, ProposalType } from "../entities/Proposal/types";

export const WELCOME_STORE_KEY: string = 'org.decentraland.governance.welcome'
export const WELCOME_STORE_VERSION: string = '1'


export type ProposalsStatusFilter = {
  status: ProposalStatus
}

export type ProposalsTypeFilter = {
  type: ProposalType,
}

export enum ProposalList {
  Enacted = 'enacted',
  MyProposals = 'proposals',
  Watchlist = 'watchlist',
}

export function toProposalList(list: string | null | undefined): ProposalList | null {
  switch(list) {
    case ProposalList.Enacted:
    case ProposalList.MyProposals:
    case ProposalList.Watchlist:
      return list
    default:
      return null
  }
}

export type ProposalListFilter = {
  list: ProposalList,
}

export type ProposalsModal = {
  modal: 'new'
}

export function url(path: string = '/', query: Record<string, string> | URLSearchParams = {}) {
  const params = new URLSearchParams(query).toString()

  return path + (params ? '?' : '') + params
}

export default {
  proposals: (options: Partial<ProposalsStatusFilter & ProposalsTypeFilter & ProposalsModal> | URLSearchParams = {}) => url('/', options),
  proposal: (proposal: string) => url(`/proposal`, { id: proposal }),
  activity: (options: Partial<ProposalsStatusFilter & ProposalListFilter> | URLSearchParams = {}) => url(`/activity`, options),
  submit: (type: ProposalType) => url(`/submit/${String(type).replace('_','-')}`, {}),
  balance: () => url(`/balance`, {}),
  welcome: () => url(`/welcome`, {}),
}