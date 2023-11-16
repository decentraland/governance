import API from 'decentraland-gatsby/dist/utils/api/API'
import { ApiResponse } from 'decentraland-gatsby/dist/utils/api/types'
import env from 'decentraland-gatsby/dist/utils/env'
import snakeCase from 'lodash/snakeCase'

import { AirdropOutcome } from '../back/types/AirdropJob'
import { SpecState } from '../components/Debug/UploadBadgeSpec'
import { GOVERNANCE_API } from '../constants'
import { BadgeCreationResult, RevokeOrReinstateResult, UserBadges } from '../entities/Badges/types'
import { BidRequest, UnpublishedBidAttributes } from '../entities/Bid/types'
import { Budget, BudgetWithContestants, CategoryBudget } from '../entities/Budget/types'
import { CoauthorAttributes, CoauthorStatus } from '../entities/Coauthor/types'
import { GrantRequest, ProposalGrantCategory } from '../entities/Grant/types'
import {
  NewProposalBanName,
  NewProposalCatalyst,
  NewProposalDraft,
  NewProposalGovernance,
  NewProposalHiring,
  NewProposalLinkedWearables,
  NewProposalPOI,
  NewProposalPitch,
  NewProposalPoll,
  NewProposalTender,
  PendingProposalsQuery,
  Project,
  ProjectWithUpdate,
  ProposalAttributes,
  ProposalCommentsInDiscourse,
  ProposalListFilter,
  ProposalStatus,
} from '../entities/Proposal/types'
import { QuarterBudgetAttributes } from '../entities/QuarterBudget/types'
import { SubscriptionAttributes } from '../entities/Subscription/types'
import { Topic } from '../entities/SurveyTopic/types'
import { ProjectHealth, UpdateAttributes, UpdateResponse } from '../entities/Updates/types'
import { AccountType } from '../entities/User/types'
import { Vote, VotedProposal, Voter } from '../entities/Votes/types'
import { NewsletterSubscriptionResult } from '../shared/types/newsletter'
import { PushNotification } from '../shared/types/notifications'
import Time from '../utils/date/Time'

import { TransparencyBudget } from './DclData'
import {
  DetailedScores,
  SnapshotConfig,
  SnapshotProposal,
  SnapshotSpace,
  SnapshotStatus,
  SnapshotVote,
  VpDistribution,
} from './SnapshotTypes'
import { VestingInfo } from './VestingData'

type NewProposalMap = {
  [`/proposals/poll`]: NewProposalPoll
  [`/proposals/draft`]: NewProposalDraft
  [`/proposals/governance`]: NewProposalGovernance
  [`/proposals/ban-name`]: NewProposalBanName
  [`/proposals/poi`]: NewProposalPOI
  [`/proposals/catalyst`]: NewProposalCatalyst
  [`/proposals/grant`]: GrantRequest
  [`/proposals/linked-wearables`]: NewProposalLinkedWearables
  [`/proposals/pitch`]: NewProposalPitch
  [`/proposals/tender`]: NewProposalTender
  [`/proposals/bid`]: BidRequest
  [`/proposals/hiring`]: NewProposalHiring
}

export type GetProposalsFilter = ProposalListFilter & {
  limit: number
  offset: number
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

  async getProjects() {
    const proposals = await this.fetch<ApiResponse<ProjectWithUpdate[]>>(`/projects`, this.options().method('GET'))

    return proposals
  }

  async getOpenPitchesTotal() {
    return await this.fetch<{ total: number }>(`/projects/pitches-total`, this.options().method('GET'))
  }

  async getOpenTendersTotal() {
    return await this.fetch<{ total: number }>(`/projects/tenders-total`, this.options().method('GET'))
  }

  async getGrantsByUser(user: string) {
    const grants = await this.fetch<ApiResponse<{ total: number; data: Project[] }>>(`/proposals/grants/${user}`)

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

  async createProposalGrant(proposal: GrantRequest) {
    return this.createProposal(`/proposals/grant`, proposal)
  }

  async createProposalLinkedWearables(proposal: NewProposalLinkedWearables) {
    return this.createProposal(`/proposals/linked-wearables`, proposal)
  }

  async createProposalPitch(proposal: NewProposalPitch) {
    return this.createProposal(`/proposals/pitch`, proposal)
  }

  async createProposalTender(proposal: NewProposalTender) {
    return this.createProposal(`/proposals/tender`, proposal)
  }

  async createProposalBid(proposal: BidRequest) {
    return this.createProposal(`/proposals/bid`, proposal)
  }

  async createProposalHiring(proposal: NewProposalHiring) {
    return this.createProposal(`/proposals/hiring`, proposal)
  }

  async deleteProposal(proposal_id: string) {
    const result = await this.fetch<ApiResponse<boolean>>(
      `/proposals/${proposal_id}`,
      this.options().method('DELETE').authorization({ sign: true })
    )

    return result.data
  }

  async updateProposalStatus(proposal_id: string, status: ProposalStatus, vesting_addresses?: string[]) {
    const result = await this.fetch<ApiResponse<ProposalAttributes>>(
      `/proposals/${proposal_id}`,
      this.options().method('PATCH').authorization({ sign: true }).json({
        status,
        vesting_addresses,
      })
    )

    return Governance.parseProposal(result.data)
  }

  async getProposalUpdate(update_id: string) {
    const result = await this.fetch<ApiResponse<UpdateAttributes>>(`/proposals/${update_id}/update`)
    return result.data
  }

  async getProposalUpdates(proposal_id: string) {
    const result = await this.fetch<ApiResponse<UpdateResponse>>(`/proposals/${proposal_id}/updates`)
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

  async getProposalCachedVotes(proposal_id: string) {
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

  async getAddressVotesWithProposals(address: string, first?: number, skip?: number) {
    const result = await this.fetch<ApiResponse<VotedProposal[]>>(`/votes/${address}?first=${first}&skip=${skip}`)
    return result.data
  }

  async getTopVoters(start: Date, end: Date, limit?: number) {
    const result = await this.fetch<ApiResponse<Voter[]>>(
      `/votes/top-voters`,
      this.options().method('POST').json({ start, end, limit })
    )
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
    if (!id) {
      return []
    }
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

  async getCategoryBudget(category: ProposalGrantCategory): Promise<CategoryBudget> {
    const response = await this.fetch<ApiResponse<CategoryBudget>>(
      `/budget/${snakeCase(category)}`,
      this.options().method('GET')
    )
    return response.data
  }

  async getTransparencyBudgets() {
    const response = await this.fetch<ApiResponse<TransparencyBudget[]>>(`/budget/fetch`, this.options().method('GET'))
    return response.data
  }

  async getCurrentBudget() {
    const response = await this.fetch<ApiResponse<Budget>>(`/budget/current`, this.options().method('GET'))
    return response.data
  }

  async getBudgetWithContestants(proposalId: string) {
    const result = await this.fetch<ApiResponse<BudgetWithContestants>>(`/budget/contested/${proposalId}`)
    return result.data
  }

  async updateGovernanceBudgets() {
    const response = await this.fetch<ApiResponse<QuarterBudgetAttributes[]>>(
      `/budget/update`,
      this.options().method('POST').authorization({ sign: true })
    )
    return response.data
  }

  async reportErrorToServer(message: string, extraInfo?: Record<string, unknown>) {
    const response = await this.fetch<ApiResponse<string>>(
      `/debug/report-error`,
      this.options().method('POST').authorization({ sign: true }).json({ message, extraInfo })
    )
    return response.data
  }

  async triggerFunction(functionName: string) {
    const response = await this.fetch<ApiResponse<string>>(
      `/debug/trigger`,
      this.options().method('POST').authorization({ sign: true }).json({ functionName })
    )
    return response.data
  }

  async checkUrlTitle(url: string) {
    const response = await this.fetch<ApiResponse<{ title?: string }>>(
      `/url-title`,
      this.options().method('POST').json({ url })
    )
    return response.data
  }

  async getSurveyTopics(proposalId: string) {
    const result = await this.fetch<ApiResponse<Topic[]>>(
      `/proposals/${proposalId}/survey-topics`,
      this.options().method('GET')
    )

    return result.data
  }

  async getValidationMessage(account?: AccountType) {
    const params = new URLSearchParams()
    if (account) {
      params.append('account', account)
    }
    const result = await this.fetch<ApiResponse<string>>(
      `/user/validate?${params.toString()}`,
      this.options().method('GET').authorization({ sign: true })
    )

    return result.data
  }

  async validateForumProfile() {
    const result = await this.fetch<ApiResponse<{ valid: boolean }>>(
      '/user/validate/forum',
      this.options().method('POST').authorization({ sign: true })
    )

    return result.data
  }

  async validateDiscordProfile() {
    const result = await this.fetch<ApiResponse<{ valid: boolean }>>(
      '/user/validate/discord',
      this.options().method('POST').authorization({ sign: true })
    )

    return result.data
  }

  async isProfileValidated(address: string, accounts: AccountType[]) {
    const params = new URLSearchParams()
    for (const account of accounts) {
      params.append('account', account)
    }
    const result = await this.fetch<ApiResponse<boolean>>(
      `/user/${address}/is-validated/?${params.toString()}`,
      this.options().method('GET')
    )

    return result.data
  }

  async isDiscordActive() {
    const result = await this.fetch<ApiResponse<boolean>>(
      `/user/discord-status`,
      this.options().method('GET').authorization({ sign: true })
    )

    return result.data
  }

  async updateDiscordStatus(is_discord_notifications_active: boolean) {
    const result = await this.fetch<ApiResponse<void>>(
      `/user/discord-status`,
      this.options().method('POST').authorization({ sign: true }).json({ is_discord_notifications_active })
    )

    return result.data
  }

  async getUserProfile(address: string) {
    const result = await this.fetch<ApiResponse<{ forum_id: number | null; forum_username: string | null }>>(
      `/user/${address}`,
      this.options().method('GET')
    )

    return result.data
  }

  async getBadges(address: string) {
    const response = await this.fetch<ApiResponse<UserBadges>>(`/badges/${address}`)
    return response.data
  }

  async getBidsInfoOnTender(tenderId: string) {
    const response = await this.fetch<ApiResponse<{ is_submission_window_finished: boolean; publish_at: string }>>(
      `/bids/${tenderId}`,
      this.options().method('GET')
    )
    return response.data
  }

  async getUserBidOnTender(tenderId: string) {
    const response = await this.fetch<
      ApiResponse<Pick<UnpublishedBidAttributes, 'author_address' | 'publish_at' | 'created_at'> | null>
    >(`/bids/${tenderId}/get-user-bid`, this.options().method('GET').authorization({ sign: true }))
    return response.data
  }

  async getSnapshotConfigAndSpace(spaceName?: string) {
    const response = await this.fetch<ApiResponse<{ config: SnapshotConfig; space: SnapshotSpace }>>(
      `/snapshot/config/${spaceName}`,
      this.options().method('GET')
    )
    return response.data
  }

  async getSnapshotStatus() {
    const response = await this.fetch<ApiResponse<SnapshotStatus>>(`/snapshot/status`, this.options().method('GET'))
    return response.data
  }

  async getAddressesVotes(addresses: string[]) {
    const result = await this.fetch<ApiResponse<SnapshotVote[]>>(
      `/snapshot/votes/`,
      this.options().method('POST').json({ addresses })
    )
    return result.data
  }

  async getProposalVotes(proposalId: string) {
    const response = await this.fetch<ApiResponse<SnapshotVote[]>>(
      `/snapshot/votes/${proposalId}`,
      this.options().method('GET')
    )
    return response.data
  }

  async getAllVotesBetweenDates(start: Date, end: Date) {
    const response = await this.fetch<ApiResponse<SnapshotVote[]>>(
      `/snapshot/votes/all`,
      this.options().method('POST').json({ start, end })
    )
    return response.data
  }

  async getSnapshotProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[]) {
    const response = await this.fetch<ApiResponse<Partial<SnapshotProposal>[]>>(
      `/snapshot/proposals`,
      this.options().method('POST').json({ start, end, fields })
    )
    return response.data
  }

  async getPendingProposals(query: PendingProposalsQuery) {
    const response = await this.fetch<ApiResponse<Partial<SnapshotProposal>[]>>(
      `/snapshot/proposals/pending`,
      this.options().method('POST').json(query)
    )
    return response.data
  }

  async getProposalScores(proposalSnapshotId: string) {
    const response = await this.fetch<ApiResponse<number[]>>(
      `/snapshot/proposal-scores/${proposalSnapshotId}`,
      this.options().method('GET')
    )
    return response.data
  }

  async getVpDistribution(address: string, proposalSnapshotId?: string) {
    const snapshotId = proposalSnapshotId ? `/${proposalSnapshotId}` : ''
    const url = `/snapshot/vp-distribution/${address}${snapshotId}`
    const response = await this.fetch<ApiResponse<VpDistribution>>(url, this.options().method('GET'))
    return response.data
  }

  async getScores(addresses: string[]) {
    const response = await this.fetch<ApiResponse<DetailedScores>>(
      '/snapshot/scores',
      this.options().method('POST').json({ addresses })
    )
    return response.data
  }

  async getVestingContractData(addresses: string[]) {
    const response = await this.fetch<ApiResponse<VestingInfo[]>>(
      `/vesting`,
      this.options().method('POST').json({ addresses })
    )
    return response.data
  }

  async getUpdateComments(update_id: string) {
    const result = await this.fetch<ApiResponse<ProposalCommentsInDiscourse>>(`/proposals/${update_id}/update/comments`)
    return result.data
  }

  async airdropBadge(badgeSpecCid: string, recipients: string[]) {
    const response = await this.fetch<ApiResponse<AirdropOutcome>>(
      `/badges/airdrop/`,
      this.options().method('POST').authorization({ sign: true }).json({
        badgeSpecCid,
        recipients,
      })
    )
    return response.data
  }

  async revokeBadge(badgeSpecCid: string, recipients: string[], reason?: string) {
    const response = await this.fetch<ApiResponse<RevokeOrReinstateResult[]>>(
      `/badges/revoke/`,
      this.options().method('POST').authorization({ sign: true }).json({
        badgeSpecCid,
        recipients,
        reason,
      })
    )
    return response.data
  }

  async uploadBadgeSpec(spec: SpecState) {
    const response = await this.fetch<ApiResponse<BadgeCreationResult>>(
      `/badges/upload-badge-spec/`,
      this.options().method('POST').authorization({ sign: true }).json(spec)
    )
    return response.data
  }

  async createBadgeSpec(badgeCid: string) {
    const response = await this.fetch<ApiResponse<string>>(
      `/badges/create-badge-spec/`,
      this.options().method('POST').authorization({ sign: true }).json({ badgeCid })
    )
    return response.data
  }

  async subscribeToNewsletter(email: string) {
    const response = await this.fetch<ApiResponse<NewsletterSubscriptionResult>>(
      `/newsletter-subscribe`,
      this.options().method('POST').json({
        email,
      })
    )
    return response.data
  }

  async getUserNotifications(address: string) {
    const response = await this.fetch<ApiResponse<PushNotification[]>>(
      `/notifications/user/${address}`,
      this.options().method('GET')
    )
    return response.data
  }

  async sendNotification(recipient: string, title: string, body: string, type: number, url: string) {
    const response = await this.fetch<ApiResponse<string>>(
      `/notifications/send`,
      this.options().method('POST').authorization({ sign: true }).json({
        recipient,
        title,
        body,
        type,
        url,
      })
    )
    return response.data
  }

  async getUserLastNotification() {
    const response = await this.fetch<ApiResponse<number>>(
      `/notifications/last-notification`,
      this.options().method('GET').authorization({ sign: true })
    )
    return response.data
  }

  async updateUserLastNotification(last_notification_id: number) {
    const response = await this.fetch<ApiResponse<string>>(
      `/notifications/last-notification`,
      this.options().method('POST').authorization({ sign: true }).json({
        last_notification_id,
      })
    )
    return response.data
  }
}
