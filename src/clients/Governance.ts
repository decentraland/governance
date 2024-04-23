import snakeCase from 'lodash/snakeCase'

import { AirdropJobAttributes } from '../back/models/AirdropJob'
import { AirdropOutcome } from '../back/types/AirdropJob'
import env from '../config'
import { GOVERNANCE_API } from '../constants'
import { BadgeCreationResult, GovernanceBadgeSpec, RevokeOrReinstateResult, UserBadges } from '../entities/Badges/types'
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
  PriorityProposal,
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
import {
  UpdateAttributes,
  UpdateFinancialSection,
  UpdateGeneralSection,
  UpdateResponse,
  UpdateSubmissionDetails,
} from '../entities/Updates/types'
import { AccountType } from '../entities/User/types'
import { Participation, VoteByAddress, VotedProposal, Voter, VotesForProposals } from '../entities/Votes/types'
import { ActivityTickerEvent, EventType } from '../shared/types/events'
import { NewsletterSubscriptionResult } from '../shared/types/newsletter'
import { PushNotification } from '../shared/types/notifications'
import Time from '../utils/date/Time'

import API, { ApiOptions } from './API'
import { ApiResponse } from './ApiResponse'
import {
  DetailedScores,
  SnapshotConfig,
  SnapshotProposal,
  SnapshotSpace,
  SnapshotStatus,
  SnapshotVote,
  VpDistribution,
} from './SnapshotTypes'
import { TransparencyBudget, TransparencyVesting } from './Transparency'
import { VestingInfo } from './VestingData'

type SpecState = {
  title: string
  description: string
  expiresAt?: string
  imgUrl: string
}

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
    return `https://governance.decentraland.vote/api`
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

  async fetchApiResponse<T>(endpoint: string, options: ApiOptions = { method: 'GET', sign: false }): Promise<T> {
    return (await this.fetch<ApiResponse<T>>(endpoint, options)).data
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

  static parsePriorityProposal(proposal: PriorityProposal): PriorityProposal {
    return {
      ...proposal,
      start_at: Time.date(proposal.start_at),
      finish_at: Time.date(proposal.finish_at),
    }
  }

  async getProposal(proposalId: string) {
    const result = await this.fetch<ApiResponse<ProposalAttributes>>(`/proposals/${proposalId}`)
    return result.data ? Governance.parseProposal(result.data) : null
  }

  async getProposals(filters: Partial<GetProposalsFilter> = {}) {
    const query = this.toQueryString(filters)

    const proposals = await this.fetch<ApiResponse<ProposalAttributes[]> & { total: number }>(`/proposals${query}`, {
      method: 'GET',
      sign: !!filters.subscribed,
    })

    return {
      ...proposals,
      data: proposals.data.map((proposal) => Governance.parseProposal(proposal)),
    }
  }

  async getProjects(from?: Date, to?: Date) {
    const params = new URLSearchParams()
    if (from) {
      params.append('from', from.toISOString().split('T')[0])
    }
    if (to) {
      params.append('to', to.toISOString().split('T')[0])
    }
    const paramsStr = params.toString()
    const proposals = await this.fetchApiResponse<ProjectWithUpdate[]>(`/projects${paramsStr ? `?${paramsStr}` : ''}`)

    return proposals
  }

  async getOpenPitchesTotal() {
    return await this.fetch<{ total: number }>(`/projects/pitches-total`)
  }

  async getOpenTendersTotal() {
    return await this.fetch<{ total: number }>(`/projects/tenders-total`)
  }

  async getPriorityProposals(address?: string) {
    const url = `/proposals/priority/`
    const proposals = await this.fetch<PriorityProposal[]>(address && address.length > 0 ? url.concat(address) : url)
    return proposals.map((proposal) => Governance.parsePriorityProposal(proposal))
  }

  async getGrantsByUser(user: string) {
    return await this.fetchApiResponse<{ total: number; data: Project[] }>(`/proposals/grants/${user}`)
  }

  async createProposal<P extends keyof NewProposalMap>(path: P, proposal: NewProposalMap[P]) {
    return await this.fetchApiResponse<ProposalAttributes>(path, {
      method: 'POST',
      sign: true,
      json: proposal,
    })
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
    return await this.fetchApiResponse<boolean>(`/proposals/${proposal_id}`, { method: 'DELETE', sign: true })
  }

  async updateProposalStatus(proposal_id: string, status: ProposalStatus, vesting_addresses?: string[]) {
    const proposal = await this.fetchApiResponse<ProposalAttributes>(`/proposals/${proposal_id}`, {
      method: 'PATCH',
      sign: true,
      json: { status, vesting_addresses },
    })

    return Governance.parseProposal(proposal)
  }

  async getProposalUpdate(update_id: string) {
    return await this.fetchApiResponse<UpdateAttributes>(`/updates/${update_id}`)
  }

  async getProposalUpdates(proposal_id: string) {
    return await this.fetchApiResponse<UpdateResponse>(`/proposals/${proposal_id}/updates`)
  }

  async createProposalUpdate(
    proposal_id: string,
    update: UpdateSubmissionDetails & UpdateGeneralSection & UpdateFinancialSection
  ) {
    return await this.fetchApiResponse<UpdateAttributes>(`/proposals/${proposal_id}/update`, {
      method: 'POST',
      sign: true,
      json: update,
    })
  }

  async updateProposalUpdate(
    update_id: string,
    update: UpdateSubmissionDetails & UpdateGeneralSection & UpdateFinancialSection
  ) {
    return await this.fetchApiResponse<UpdateAttributes>(`/updates/${update_id}`, {
      method: 'PATCH',
      sign: true,
      json: update,
    })
  }

  async deleteProposalUpdate(update_id: UpdateAttributes['id']) {
    return await this.fetchApiResponse<UpdateAttributes>(`/updates/${update_id}`, {
      method: 'DELETE',
      sign: true,
    })
  }

  async getVotesByProposal(proposal_id: string) {
    return await this.fetchApiResponse<VoteByAddress>(`/proposals/${proposal_id}/votes`)
  }

  async getCachedVotesByProposals(proposal_ids: string[]) {
    if (proposal_ids.length === 0) {
      return {}
    }

    const params = proposal_ids.reduce((result, id) => {
      result.append('id', id)
      return result
    }, new URLSearchParams())

    return await this.fetchApiResponse<VotesForProposals>(`/votes?${params.toString()}`)
  }

  async getVotesAndProposalsByAddress(address: string, first?: number, skip?: number) {
    return await this.fetchApiResponse<VotedProposal[]>(`/votes/${address}?first=${first}&skip=${skip}`)
  }

  async getTopVotersForLast30Days() {
    return await this.fetchApiResponse<Voter[]>(`/votes/top-voters`)
  }

  async getParticipation() {
    return await this.fetchApiResponse<Participation>(`/votes/participation`)
  }

  async getUserSubscriptions() {
    return await this.fetchApiResponse<SubscriptionAttributes[]>(`/subscriptions`, { method: 'GET', sign: true })
  }

  async getSubscriptions(proposal_id: string) {
    return await this.fetchApiResponse<SubscriptionAttributes[]>(`/proposals/${proposal_id}/subscriptions`)
  }

  async subscribe(proposal_id: string) {
    return await this.fetchApiResponse<SubscriptionAttributes>(`/proposals/${proposal_id}/subscriptions`, {
      method: 'POST',
      sign: true,
    })
  }

  async unsubscribe(proposal_id: string) {
    return await this.fetchApiResponse<boolean>(`/proposals/${proposal_id}/subscriptions`, {
      method: 'DELETE',
      sign: true,
    })
  }

  async getCommittee() {
    return await this.fetchApiResponse<string[]>(`/committee`)
  }

  async getDebugAddresses() {
    return await this.fetchApiResponse<string[]>(`/debug`)
  }

  async getProposalComments(proposal_id: string) {
    return await this.fetchApiResponse<ProposalCommentsInDiscourse>(`/proposals/${proposal_id}/comments`)
  }

  async getProposalsByCoAuthor(address: string, status?: CoauthorStatus) {
    return await this.fetchApiResponse<CoauthorAttributes[]>(
      `/coauthors/proposals/${address}${status ? `/${status}` : ''}`
    )
  }

  async getCoAuthorsByProposal(id: string, status?: CoauthorStatus) {
    if (!id) {
      return []
    }
    return await this.fetchApiResponse<CoauthorAttributes[]>(`/coauthors/${id}${status ? `/${status}` : ''}`)
  }

  async updateCoauthorStatus(proposalId: string, status: CoauthorStatus) {
    return await this.fetchApiResponse<CoauthorAttributes>(`/coauthors/${proposalId}`, {
      method: 'PUT',
      sign: true,
      json: { status },
    })
  }

  async checkImage(imageUrl: string) {
    return await this.fetchApiResponse<boolean>(`/proposals/linked-wearables/image?url=${imageUrl}`)
  }

  async getCategoryBudget(category: ProposalGrantCategory): Promise<CategoryBudget> {
    return await this.fetchApiResponse<CategoryBudget>(`/budget/${snakeCase(category)}`)
  }

  async getTransparencyBudgets() {
    return await this.fetchApiResponse<TransparencyBudget[]>(`/budget/fetch`)
  }

  async getCurrentBudget() {
    return await this.fetchApiResponse<Budget>(`/budget/current`)
  }

  async getAllBudgets() {
    return await this.fetchApiResponse<Budget[]>(`/budget/all`)
  }

  async getBudgetWithContestants(proposalId: string) {
    return await this.fetchApiResponse<BudgetWithContestants>(`/budget/contested/${proposalId}`)
  }

  async updateGovernanceBudgets() {
    return await this.fetchApiResponse<QuarterBudgetAttributes[]>(`/budget/update`, {
      method: 'POST',
      sign: true,
    })
  }

  async reportErrorToServer(message: string, extraInfo?: Record<string, unknown>) {
    return await this.fetchApiResponse<string>(`/debug/report-error`, {
      method: 'POST',
      sign: true,
      json: { message, extraInfo },
    })
  }

  async triggerFunction(functionName: string) {
    return await this.fetchApiResponse<string>(`/debug/trigger`, {
      method: 'POST',
      sign: true,
      json: { functionName },
    })
  }

  async invalidateCache(key: string) {
    return await this.fetchApiResponse<number>(`/debug/invalidate-cache`, {
      method: 'DELETE',
      sign: true,
      json: { key },
    })
  }

  async checkUrlTitle(url: string) {
    return await this.fetchApiResponse<{ title?: string }>(`/url-title`, { method: 'POST', json: { url } })
  }

  async getSurveyTopics(proposalId: string) {
    return await this.fetchApiResponse<Topic[]>(`/proposals/${proposalId}/survey-topics`)
  }

  async getValidationMessage(account?: AccountType) {
    const params = new URLSearchParams()
    if (account) {
      params.append('account', account)
    }
    return await this.fetchApiResponse<string>(`/user/validate?${params.toString()}`, {
      method: 'GET',
      sign: true,
    })
  }

  async validateForumProfile() {
    return await this.fetchApiResponse<{ valid: boolean }>('/user/validate/forum', { method: 'POST', sign: true })
  }

  async validateDiscordProfile() {
    return await this.fetchApiResponse<{ valid: boolean }>('/user/validate/discord', { method: 'POST', sign: true })
  }

  async isProfileValidated(address: string, accounts: AccountType[]) {
    const params = new URLSearchParams()
    for (const account of accounts) {
      params.append('account', account)
    }
    return await this.fetchApiResponse<boolean>(`/user/${address}/is-validated/?${params.toString()}`)
  }

  async isDiscordActive() {
    return await this.fetchApiResponse<boolean>(`/user/discord-active`, { method: 'GET', sign: true })
  }

  async isDiscordLinked() {
    return await this.fetchApiResponse<boolean>(`/user/discord-linked`, { method: 'GET', sign: true })
  }

  async updateDiscordStatus(is_discord_notifications_active: boolean) {
    return await this.fetchApiResponse<void>(`/user/discord-active`, {
      method: 'POST',
      sign: true,
      json: { is_discord_notifications_active },
    })
  }

  async getUserProfile(address: string) {
    return await this.fetchApiResponse<{ forum_id: number | null; forum_username: string | null }>(`/user/${address}`)
  }

  async getBadges(address: string) {
    return await this.fetchApiResponse<UserBadges>(`/badges/${address}`)
  }

  async getCoreUnitsBadges() {
    return await this.fetchApiResponse<GovernanceBadgeSpec[]>(`/badges/core-units`)
  }

  async getBidsInfoOnTender(tenderId: string) {
    return await this.fetchApiResponse<{ is_submission_window_finished: boolean; publish_at: string }>(
      `/bids/${tenderId}`
    )
  }

  async getUserBidOnTender(tenderId: string) {
    return await this.fetchApiResponse<Pick<
      UnpublishedBidAttributes,
      'author_address' | 'publish_at' | 'created_at'
    > | null>(`/bids/${tenderId}/get-user-bid`, { method: 'GET', sign: true })
  }

  async getSnapshotConfigAndSpace(spaceName?: string) {
    return await this.fetchApiResponse<{ config: SnapshotConfig; space: SnapshotSpace }>(
      `/snapshot/config/${spaceName}`
    )
  }

  async getSnapshotStatus() {
    return await this.fetchApiResponse<SnapshotStatus>(`/snapshot/status`)
  }

  async getVotesByAddresses(addresses: string[]) {
    return await this.fetchApiResponse<SnapshotVote[]>(`/snapshot/votes/`, {
      method: 'POST',
      json: { addresses },
    })
  }

  async getVotesByProposalFromSnapshot(proposalId: string) {
    return await this.fetchApiResponse<SnapshotVote[]>(`/snapshot/votes/${proposalId}`)
  }

  async getSnapshotProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[]) {
    return await this.fetchApiResponse<Partial<SnapshotProposal>[]>(`/snapshot/proposals`, {
      method: 'POST',
      json: { start, end, fields },
    })
  }

  async getPendingProposals(query: PendingProposalsQuery) {
    return await this.fetchApiResponse<Partial<SnapshotProposal>[]>(`/snapshot/proposals/pending`, {
      method: 'POST',
      json: query,
    })
  }

  async getProposalScores(proposalSnapshotId: string) {
    return await this.fetchApiResponse<number[]>(`/snapshot/proposal-scores/${proposalSnapshotId}`)
  }

  async getVpDistribution(address: string, proposalSnapshotId?: string) {
    const snapshotId = proposalSnapshotId ? `/${proposalSnapshotId}` : ''
    const url = `/snapshot/vp-distribution/${address}${snapshotId}`
    return await this.fetchApiResponse<VpDistribution>(url)
  }

  async getScores(addresses: string[]) {
    return await this.fetchApiResponse<DetailedScores>('/snapshot/scores', { method: 'POST', json: { addresses } })
  }

  async getAllVestings() {
    return await this.fetchApiResponse<TransparencyVesting[]>(`/all-vestings`)
  }

  async getVestingContractData(addresses: string[]) {
    return await this.fetchApiResponse<VestingInfo[]>(`/vesting`, { method: 'POST', json: { addresses } })
  }

  async getUpdateComments(update_id: string) {
    return await this.fetchApiResponse<ProposalCommentsInDiscourse>(`/updates/${update_id}/comments`)
  }

  async airdropBadge(badgeSpecCid: string, recipients: string[]) {
    return await this.fetchApiResponse<AirdropOutcome>(`/badges/airdrop/`, {
      method: 'POST',
      sign: true,
      json: {
        badgeSpecCid,
        recipients,
      },
    })
  }

  async revokeBadge(badgeSpecCid: string, recipients: string[], reason?: string) {
    return await this.fetchApiResponse<RevokeOrReinstateResult[]>(`/badges/revoke/`, {
      method: 'POST',
      sign: true,
      json: {
        badgeSpecCid,
        recipients,
        reason,
      },
    })
  }

  async uploadBadgeSpec(spec: SpecState) {
    return await this.fetchApiResponse<BadgeCreationResult>(`/badges/upload-badge-spec/`, {
      method: 'POST',
      sign: true,
      json: {
        spec,
      },
    })
  }

  async createBadgeSpec(badgeCid: string) {
    return await this.fetchApiResponse<string>(`/badges/create-badge-spec/`, {
      method: 'POST',
      sign: true,
      json: {
        badgeCid,
      },
    })
  }

  async subscribeToNewsletter(email: string) {
    return await this.fetchApiResponse<NewsletterSubscriptionResult>(`/newsletter-subscribe`, {
      method: 'POST',
      json: {
        email,
      },
    })
  }

  async getUserNotifications(address: string) {
    return await this.fetchApiResponse<PushNotification[]>(`/notifications/user/${address}`)
  }

  async sendNotification(recipient: string, title: string, body: string, type: number, url: string) {
    return await this.fetchApiResponse<string>(`/notifications/send`, {
      method: 'POST',
      sign: true,
      json: {
        recipient,
        title,
        body,
        type,
        url,
      },
    })
  }

  async getUserLastNotification() {
    return await this.fetchApiResponse<number>(`/notifications/last-notification`, {
      method: 'GET',
      sign: true,
    })
  }

  async updateUserLastNotification(last_notification_id: number) {
    return await this.fetchApiResponse<string>(`/notifications/last-notification`, {
      method: 'POST',
      sign: true,
      json: { last_notification_id },
    })
  }

  async getLatestEvents(eventTypes: EventType[]) {
    const query = this.toQueryString({ event_type: eventTypes })
    return await this.fetchApiResponse<ActivityTickerEvent[]>(`/events${query}`)
  }

  async createVoteEvent(proposalId: string, proposalTitle: string, choice: string) {
    return await this.fetchApiResponse<string>(`/events/voted`, {
      method: 'POST',
      sign: true,
      json: { proposalId, proposalTitle, choice },
    })
  }

  async getAllEvents() {
    return await this.fetchApiResponse<ActivityTickerEvent[]>(`/events/all`, { method: 'GET', sign: true })
  }

  async getAllAirdropJobs() {
    return await this.fetchApiResponse<AirdropJobAttributes[]>(`/airdrops/all`, {
      method: 'GET',
      sign: true,
    })
  }
}
