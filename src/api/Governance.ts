import API from 'decentraland-gatsby/dist/utils/api/API';
import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types';
import Time from 'decentraland-gatsby/dist/utils/date/Time';
import env from 'decentraland-gatsby/dist/utils/env';
import {
  NewProposalBanName,
  NewProposalCatalyst,
  NewProposalPOI,
  NewProposalPoll,
  NewProposalGrant,
  NewProposalLinkedWearables,
  ProposalAttributes,
  ProposalType,
  ProposalStatus,
  NewProposalDraft,
  NewProposalGovernance,
  ProposalCommentsInDiscourse
} from '../entities/Proposal/types';
import { SubscriptionAttributes } from '../entities/Subscription/types';
import { Vote } from '../entities/Votes/types';

type NewProposalMap = {
  [`/proposals/poll`]: NewProposalPoll,
  [`/proposals/draft`]: NewProposalDraft,
  [`/proposals/governance`]: NewProposalGovernance,
  [`/proposals/ban-name`]: NewProposalBanName,
  [`/proposals/poi`]: NewProposalPOI,
  [`/proposals/catalyst`]: NewProposalCatalyst,
  [`/proposals/grant`]: NewProposalGrant,
  [`/proposals/linked-wearables`]: NewProposalLinkedWearables,
}

export type GetProposalsFilter = {
  user: string,
  type: ProposalType,
  status: ProposalStatus,
  subscribed: boolean | string,
  search?: string | null,
  timeFrame?: string | null,
  order?: "ASC" | "DESC"
  limit: number,
  offset: number
}

export class Governance extends API {

  static Url = (
    process.env.GATSBY_GOVERNANCE_API ||
    process.env.REACT_APP_GOVERNANCE_API ||
    process.env.STORYBOOK_GOVERNANCE_API ||
    process.env.GOVERNANCE_API ||
    'https://governance.decentraland.org/api'
  )

  static Cache = new Map<string, Governance>()

  static from(baseUrl: string) {
    if (!this.Cache.has(baseUrl)) {
      this.Cache.set(baseUrl, new this(baseUrl))
    }

    return this.Cache.get(baseUrl)!
  }

  static get() {
    return this.from(env('GOVERNANCE_API', this.Url))
  }

  static parseProposal(proposal: ProposalAttributes): ProposalAttributes {
    return {
      ...proposal,
      start_at: Time.date(proposal.start_at),
      finish_at: Time.date(proposal.finish_at),
      updated_at: Time.date(proposal.updated_at),
      created_at: Time.date(proposal.created_at),
    }
  }

  async getProposal(proposalId: string) {
    const result = await this.fetch<ApiResponse<ProposalAttributes>>(`/proposals/${proposalId}`)
    return result.data ? Governance.parseProposal(result.data) : null
  }

  async getProposals(filters: Partial<GetProposalsFilter> = {}) {
    const params = new URLSearchParams(filters as any)
    let query = params.toString()
    if (query) {
      query = '?' + query
    }

    let options = this.options().method('GET')
    if (filters.subscribed) {
      options = options.authorization({ sign: true })
    }

    const proposals = await this.fetch<ApiResponse<ProposalAttributes[]> & { total: number }>(`/proposals${query}`, options)
    return {
      ...proposals,
      data: proposals.data.map(proposal => Governance.parseProposal(proposal))
    }
  }

  async createProposal<P extends keyof NewProposalMap>(path: P, proposal: NewProposalMap[P]) {
    const newProposal = await this.fetch<ApiResponse<ProposalAttributes>>(
      path,
      this.options()
        .method('POST')
        .authorization({ sign: true })
        .json(proposal)
    )

    return newProposal.data
  }

  async createProposalPoll(proposal: NewProposalPoll) {
    return this.createProposal(`/proposals/poll`, proposal)
  }

  async createProposalDraft(proposal: NewProposalDraft) {
    return this.createProposal(`/proposals/draft`, proposal)
  }

  async createProposalGovernance(proposal: NewProposalGovernance) {
    return this.createProposal(`/proposals/governance`, proposal)
  }

  async createProposalBanName(proposal: NewProposalBanName) {
    return this.createProposal(`/proposals/ban-name`, proposal)
  }

  async createProposalPOI(proposal: NewProposalPOI) {
    return this.createProposal(`/proposals/poi`, proposal)
  }

  async createProposalCatalyst(proposal: NewProposalCatalyst) {
    return this.createProposal(`/proposals/catalyst`, proposal)
  }

  async createProposalGrant(proposal: NewProposalGrant) {
    return this.createProposal(`/proposals/grant`, proposal)
  }
  
  async createProposalLinkedWearables(proposal: NewProposalLinkedWearables) {
    return this.createProposal(`/proposals/linked-wearables`, proposal)
  }

  async deleteProposal(proposal_id: string) {
    const result = await this.fetch<ApiResponse<boolean>>(
      `/proposals/${proposal_id}`,
      this.options().method('DELETE').authorization({ sign: true })
    )

    return result.data
  }

  async updateProposalStatus(proposal_id: string, status: ProposalStatus, vesting_address: string | null, description: string | null = null) {
    const result = await this.fetch<ApiResponse<ProposalAttributes>>(
      `/proposals/${proposal_id}`,
      this.options()
        .method('PATCH')
        .authorization({ sign: true })
        .json({ status, vesting_address, description })
    )

    return result.data
  }

  async getProposalVotes(proposal_id: string) {
    const result = await this.fetch<ApiResponse<Record<string, Vote>>>(`/proposals/${proposal_id}/votes`)
    return result.data
  }

  async getVotes(proposal_ids: string[]) {
    if (proposal_ids.length === 0) {
      return {}
    }

    const params = proposal_ids.reduce((result, id) => {
      result.append('id', id)
      return result
    }, new URLSearchParams)

    const result = await this.fetch<ApiResponse<Record<string, Record<string, Vote>>>>(`/votes?${params.toString()}`)
    return result.data
  }

  async getUserSubscriptions() {
    const result = await this.fetch<ApiResponse<SubscriptionAttributes[]>>(
      `/subscriptions`,
      this.options().method('GET').authorization({ sign: true })
    )
    return result.data
  }

  async getSubscriptions(proposal_id: string) {
    const result = await this.fetch<ApiResponse<SubscriptionAttributes[]>>(`/proposals/${proposal_id}/subscriptions`)
    return result.data
  }

  async subscribe(proposal_id: string) {
    const result = await this.fetch<ApiResponse<SubscriptionAttributes>>(
      `/proposals/${proposal_id}/subscriptions`,
      this.options()
        .method('POST')
        .authorization({ sign: true })
    )
    return result.data
  }

  async unsubscribe(proposal_id: string) {
    const result = await this.fetch<ApiResponse<boolean>>(
      `/proposals/${proposal_id}/subscriptions`,
      this.options()
        .method('DELETE')
        .authorization({ sign: true })
    )
    return result.data
  }

  async getVotingPower(proposal_id: string) {
    const result = await this.fetch<ApiResponse<number>>(`/proposals/${proposal_id}/vp`, this.options().method('GET').authorization({ sign: true }))
    return result.data
  }

  async getCommittee() {
    const result = await this.fetch<ApiResponse<string[]>>(`/committee`)
    return result.data
  }

  async getProposalComments(proposal_id: string) {
    const result = await this.fetch<ApiResponse<ProposalCommentsInDiscourse>>(`/proposals/${proposal_id}/comments`)
    return result.data
  }
}
