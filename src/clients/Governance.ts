import API from 'decentraland-gatsby/dist/utils/api/API'
import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import env from 'decentraland-gatsby/dist/utils/env'

import { GOVERNANCE_API } from '../constants'
import { CoauthorAttributes, CoauthorStatus } from '../entities/Coauthor/types'
import {
  GrantsResponse,
  NewProposalBanName,
  NewProposalCatalyst,
  NewProposalDraft,
  NewProposalGovernance,
  NewProposalGrant,
  NewProposalLinkedWearables,
  NewProposalPOI,
  NewProposalPoll,
  ProposalAttributes,
  ProposalCommentsInDiscourse,
  ProposalStatus,
  ProposalType,
} from '../entities/Proposal/types'
import { SubscriptionAttributes } from '../entities/Subscription/types'
import { SurveyTopicAttributes } from '../entities/SurveyTopic/types'
import { ProjectHealth, UpdateAttributes } from '../entities/Updates/types'
import { Vote, VotedProposal } from '../entities/Votes/types'

type NewProposalMap = {
  [`/proposals/poll`]: NewProposalPoll
  [`/proposals/draft`]: NewProposalDraft
  [`/proposals/governance`]: NewProposalGovernance
  [`/proposals/ban-name`]: NewProposalBanName
  [`/proposals/poi`]: NewProposalPOI
  [`/proposals/catalyst`]: NewProposalCatalyst
  [`/proposals/grant`]: NewProposalGrant
  [`/proposals/linked-wearables`]: NewProposalLinkedWearables
}

export type GetProposalsFilter = {
  user: string
  type: ProposalType
  status: ProposalStatus
  subscribed: boolean | string
  coauthor: boolean
  search?: string | null
  timeFrame?: string | null
  timeFrameKey?: string | null
  order?: 'ASC' | 'DESC'
  limit: number
  offset: number
  snapshotIds?: string
}

const getGovernanceApiUrl = () => {
  if (process.env.GATSBY_HEROKU_APP_NAME) {
    return `https://${process.env.GATSBY_HEROKU_APP_NAME}.herokuapp.com/api`
  }

  return GOVERNANCE_API
}

export class Governance extends API {
  static Url = getGovernanceApiUrl()

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
    const params = new URLSearchParams(filters as never)
    let query = params.toString()
    if (query) {
      query = '?' + query
    }

    let options = this.options().method('GET')
    if (filters.subscribed) {
      options = options.authorization({ sign: true })
    }

    const proposals = await this.fetch<ApiResponse<ProposalAttributes[]> & { total: number }>(
      `/proposals${query}`,
      options
    )
    return {
      ...proposals,
      data: proposals.data.map((proposal) => Governance.parseProposal(proposal)),
    }
  }

  async getGrants() {
    const proposals = await this.fetch<ApiResponse<GrantsResponse>>('/proposals/grants')

    return proposals.data
  }

  async getGrantsByUser(user: string, coauthoring?: boolean) {
    const grants = await this.fetch<ApiResponse<GrantsResponse>>(
      `/proposals/grants/${user}?coauthoring=${!!coauthoring}`
    )

    return grants.data
  }

  async createProposal<P extends keyof NewProposalMap>(path: P, proposal: NewProposalMap[P]) {
    const newProposal = await this.fetch<ApiResponse<ProposalAttributes>>(
      path,
      this.options().method('POST').authorization({ sign: true }).json(proposal)
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

  async updateProposalStatus(
    proposal_id: string,
    status: ProposalStatus,
    vesting_address: string | null,
    enacting_tx: string | null,
    description: string | null = null
  ) {
    const result = await this.fetch<ApiResponse<ProposalAttributes>>(
      `/proposals/${proposal_id}`,
      this.options().method('PATCH').authorization({ sign: true }).json({
        status,
        vesting_address,
        enacting_tx,
        description,
      })
    )

    return Governance.parseProposal(result.data)
  }

  async getProposalUpdate(update_id: string) {
    const result = await this.fetch<ApiResponse<UpdateAttributes>>(`/proposals/${update_id}/update`)
    return result.data
  }

  async getProposalUpdates(proposal_id: string) {
    const result = await this.fetch<
      ApiResponse<{
        publicUpdates: UpdateAttributes[]
        pendingUpdates: UpdateAttributes[]
        nextUpdate: UpdateAttributes
        currentUpdate: UpdateAttributes | null
      }>
    >(`/proposals/${proposal_id}/updates`)
    return result.data
  }

  async createProposalUpdate(update: {
    proposal_id: string
    author: string
    health: ProjectHealth
    introduction: string
    highlights: string
    blockers: string
    next_steps: string
    additional_notes: string
  }) {
    const result = await this.fetch<ApiResponse<UpdateAttributes>>(
      `/proposals/${update.proposal_id}/update`,
      this.options().method('POST').authorization({ sign: true }).json(update)
    )
    return result.data
  }

  async updateProposalUpdate(update: {
    id: string
    proposal_id: string
    author: string
    health: ProjectHealth
    introduction: string
    highlights: string
    blockers: string
    next_steps: string
    additional_notes: string
  }) {
    const result = await this.fetch<ApiResponse<UpdateAttributes>>(
      `/proposals/${update.proposal_id}/update`,
      this.options().method('PATCH').authorization({ sign: true }).json(update)
    )
    return result.data
  }

  async deleteProposalUpdate(update: { id: string; proposal_id: string }) {
    const result = await this.fetch<ApiResponse<UpdateAttributes>>(
      `/proposals/${update.proposal_id}/update`,
      this.options().method('DELETE').authorization({ sign: true }).json(update)
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
    }, new URLSearchParams())

    const result = await this.fetch<ApiResponse<Record<string, Record<string, Vote>>>>(`/votes?${params.toString()}`)
    return result.data
  }

  async getAddressVotes(address: string, first?: number, skip?: number) {
    const result = await this.fetch<ApiResponse<VotedProposal[]>>(`/votes/${address}?first=${first}&skip=${skip}`)
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
      this.options().method('POST').authorization({ sign: true })
    )
    return result.data
  }

  async unsubscribe(proposal_id: string) {
    const result = await this.fetch<ApiResponse<boolean>>(
      `/proposals/${proposal_id}/subscriptions`,
      this.options().method('DELETE').authorization({ sign: true })
    )
    return result.data
  }

  async getCommittee() {
    const result = await this.fetch<ApiResponse<string[]>>(`/committee`)
    return result.data
  }

  async getDebugAddresses() {
    const result = await this.fetch<ApiResponse<string[]>>(`/debug`)
    return result.data
  }

  async getProposalComments(proposal_id: string) {
    const result = await this.fetch<ApiResponse<ProposalCommentsInDiscourse>>(`/proposals/${proposal_id}/comments`)
    return result.data
  }

  async getProposalsByCoAuthor(address: string, status?: CoauthorStatus) {
    const result = await this.fetch<ApiResponse<CoauthorAttributes[]>>(
      `/coauthors/proposals/${address}${status ? `/${status}` : ''}`
    )
    return result.data
  }

  async getCoAuthorsByProposal(id: string, status?: CoauthorStatus) {
    const result = await this.fetch<ApiResponse<CoauthorAttributes[]>>(`/coauthors/${id}${status ? `/${status}` : ''}`)
    return result.data
  }

  async updateCoauthorStatus(proposalId: string, status: CoauthorStatus) {
    const newStatus = await this.fetch<ApiResponse<CoauthorAttributes>>(
      `/coauthors/${proposalId}`,
      this.options().method('PUT').authorization({ sign: true }).json({ status })
    )

    return newStatus.data
  }

  async checkImage(imageUrl: string) {
    const response = await this.fetch<ApiResponse<boolean>>(
      `/proposals/linked-wearables/image?url=${imageUrl}`,
      this.options().method('GET')
    )

    return response.data
  }

  async getSurveyTopics(proposalId: string) {
    const result = await this.fetch<ApiResponse<SurveyTopicAttributes[]>>(
      `/surveyTopics/${proposalId}`,
      this.options().method('GET').authorization({ sign: true })
    )

    return result.data
  }
}
