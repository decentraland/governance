import snakeCase from 'lodash/snakeCase'

import { AirdropJobAttributes } from '../back/models/AirdropJob'
import { AirdropOutcome } from '../back/types/AirdropJob'
import { SpecState } from '../components/Debug/UploadBadgeSpec'
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
  FinancialUpdateSection,
  GeneralUpdateSection,
  UpdateAttributes,
  UpdateResponse,
  UpdateSubmissionDetails,
} from '../entities/Updates/types'
import { AccountType } from '../entities/User/types'
import { Participation, VoteByAddress, VotedProposal, Voter, VotesForProposals } from '../entities/Votes/types'
import { ActivityTickerEvent } from '../shared/types/events'
import { NewsletterSubscriptionResult } from '../shared/types/newsletter'
import { PushNotification } from '../shared/types/notifications'
import Time from '../utils/date/Time'

import API from './API'
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
    return `https://governance.decentraland.vote/api/`
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
    const params = new URLSearchParams(filters as never)
    let query = params.toString()
    if (query) {
      query = '?' + query
    }

    const proposals = await this.fetch<ApiResponse<ProposalAttributes[]> & { total: number }>(`/proposals${query}`, {
      method: 'GET',
      sign: !!filters.subscribed,
    })

    return {
      ...proposals,
      data: proposals.data.map((proposal) => Governance.parseProposal(proposal)),
    }
  }

  async getProjects() {
    return await this.fetch<ApiResponse<ProjectWithUpdate[]>>(`/projects`)
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
    return (await this.fetch<ApiResponse<{ total: number; data: Project[] }>>(`/proposals/grants/${user}`)).data
  }

  async createProposal<P extends keyof NewProposalMap>(path: P, proposal: NewProposalMap[P]) {
    const newProposal = await this.fetch<ApiResponse<ProposalAttributes>>(path, {
      method: 'POST',
      sign: true,
      json: proposal,
    })

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
    const result = await this.fetch<ApiResponse<boolean>>(`/proposals/${proposal_id}`, { method: 'DELETE', sign: true })

    return result.data
  }

  async updateProposalStatus(proposal_id: string, status: ProposalStatus, vesting_addresses?: string[]) {
    const result = await this.fetch<ApiResponse<ProposalAttributes>>(`/proposals/${proposal_id}`, {
      method: 'PATCH',
      sign: true,
      json: { status, vesting_addresses },
    })

    return Governance.parseProposal(result.data)
  }

  async getProposalUpdate(update_id: string) {
    return (await this.fetch<ApiResponse<UpdateAttributes>>(`/proposals/${update_id}/update`)).data
  }

  async getProposalUpdates(proposal_id: string) {
    return (await this.fetch<ApiResponse<UpdateResponse>>(`/proposals/${proposal_id}/updates`)).data
  }

  async createProposalUpdate(
    proposal_id: string,
    update: UpdateSubmissionDetails & GeneralUpdateSection & FinancialUpdateSection
  ) {
    return (
      await this.fetch<ApiResponse<UpdateAttributes>>(`/proposals/${proposal_id}/update`, {
        method: 'POST',
        sign: true,
        json: update,
      })
    ).data
  }

  async updateProposalUpdate(
    proposal_id: string,
    update: UpdateSubmissionDetails & GeneralUpdateSection & FinancialUpdateSection
  ) {
    return (
      await this.fetch<ApiResponse<UpdateAttributes>>(`/proposals/${proposal_id}/update`, {
        method: 'PATCH',
        sign: true,
        json: update,
      })
    ).data
  }

  async deleteProposalUpdate(update: { id: string; proposal_id: string }) {
    return (
      await this.fetch<ApiResponse<UpdateAttributes>>(`/proposals/${update.proposal_id}/update`, {
        method: 'DELETE',
        sign: true,
        json: update,
      })
    ).data
  }

  async getVotesByProposal(proposal_id: string) {
    return (await this.fetch<ApiResponse<VoteByAddress>>(`/proposals/${proposal_id}/votes`)).data
  }

  async getCachedVotesByProposals(proposal_ids: string[]) {
    if (proposal_ids.length === 0) {
      return {}
    }

    const params = proposal_ids.reduce((result, id) => {
      result.append('id', id)
      return result
    }, new URLSearchParams())

    return (await this.fetch<ApiResponse<VotesForProposals>>(`/votes?${params.toString()}`)).data
  }

  async getVotesAndProposalsByAddress(address: string, first?: number, skip?: number) {
    return (await this.fetch<ApiResponse<VotedProposal[]>>(`/votes/${address}?first=${first}&skip=${skip}`)).data
  }

  async getTopVotersForLast30Days() {
    return (await this.fetch<ApiResponse<Voter[]>>(`/votes/top-voters`)).data
  }

  async getParticipation() {
    return (await this.fetch<ApiResponse<Participation>>(`/votes/participation`)).data
  }

  async getUserSubscriptions() {
    return (await this.fetch<ApiResponse<SubscriptionAttributes[]>>(`/subscriptions`, { method: 'GET', sign: true }))
      .data
  }

  async getSubscriptions(proposal_id: string) {
    return (await this.fetch<ApiResponse<SubscriptionAttributes[]>>(`/proposals/${proposal_id}/subscriptions`)).data
  }

  async subscribe(proposal_id: string) {
    return (
      await this.fetch<ApiResponse<SubscriptionAttributes>>(`/proposals/${proposal_id}/subscriptions`, {
        method: 'POST',
        sign: true,
      })
    ).data
  }

  async unsubscribe(proposal_id: string) {
    return (
      await this.fetch<ApiResponse<boolean>>(`/proposals/${proposal_id}/subscriptions`, {
        method: 'DELETE',
        sign: true,
      })
    ).data
  }

  async getCommittee() {
    return (await this.fetch<ApiResponse<string[]>>(`/committee`)).data
  }

  async getDebugAddresses() {
    return (await this.fetch<ApiResponse<string[]>>(`/debug`)).data
  }

  async getProposalComments(proposal_id: string) {
    return (await this.fetch<ApiResponse<ProposalCommentsInDiscourse>>(`/proposals/${proposal_id}/comments`)).data
  }

  async getProposalsByCoAuthor(address: string, status?: CoauthorStatus) {
    return (
      await this.fetch<ApiResponse<CoauthorAttributes[]>>(
        `/coauthors/proposals/${address}${status ? `/${status}` : ''}`
      )
    ).data
  }

  async getCoAuthorsByProposal(id: string, status?: CoauthorStatus) {
    if (!id) {
      return []
    }
    return (await this.fetch<ApiResponse<CoauthorAttributes[]>>(`/coauthors/${id}${status ? `/${status}` : ''}`)).data
  }

  async updateCoauthorStatus(proposalId: string, status: CoauthorStatus) {
    return (
      await this.fetch<ApiResponse<CoauthorAttributes>>(`/coauthors/${proposalId}`, {
        method: 'PUT',
        sign: true,
        json: { status },
      })
    ).data
  }

  async checkImage(imageUrl: string) {
    return (await this.fetch<ApiResponse<boolean>>(`/proposals/linked-wearables/image?url=${imageUrl}`)).data
  }

  async getCategoryBudget(category: ProposalGrantCategory): Promise<CategoryBudget> {
    return (await this.fetch<ApiResponse<CategoryBudget>>(`/budget/${snakeCase(category)}`)).data
  }

  async getTransparencyBudgets() {
    return (await this.fetch<ApiResponse<TransparencyBudget[]>>(`/budget/fetch`)).data
  }

  async getCurrentBudget() {
    return (await this.fetch<ApiResponse<Budget>>(`/budget/current`)).data
  }

  async getBudgetWithContestants(proposalId: string) {
    return (await this.fetch<ApiResponse<BudgetWithContestants>>(`/budget/contested/${proposalId}`)).data
  }

  async updateGovernanceBudgets() {
    return (
      await this.fetch<ApiResponse<QuarterBudgetAttributes[]>>(`/budget/update`, {
        method: 'POST',
        sign: true,
      })
    ).data
  }

  async reportErrorToServer(message: string, extraInfo?: Record<string, unknown>) {
    return (
      await this.fetch<ApiResponse<string>>(`/debug/report-error`, {
        method: 'POST',
        sign: true,
        json: { message, extraInfo },
      })
    ).data
  }

  async triggerFunction(functionName: string) {
    return (
      await this.fetch<ApiResponse<string>>(`/debug/trigger`, {
        method: 'POST',
        sign: true,
        json: { functionName },
      })
    ).data
  }

  async invalidateCache(key: string) {
    return (
      await this.fetch<ApiResponse<number>>(`/debug/invalidate-cache`, { method: 'DELETE', sign: true, json: { key } })
    ).data
  }

  async checkUrlTitle(url: string) {
    return (await this.fetch<ApiResponse<{ title?: string }>>(`/url-title`, { method: 'POST', json: { url } })).data
  }

  async getSurveyTopics(proposalId: string) {
    return (await this.fetch<ApiResponse<Topic[]>>(`/proposals/${proposalId}/survey-topics`)).data
  }

  async getValidationMessage(account?: AccountType) {
    const params = new URLSearchParams()
    if (account) {
      params.append('account', account)
    }
    return (
      await this.fetch<ApiResponse<string>>(`/user/validate?${params.toString()}`, {
        method: 'GET',
        sign: true,
      })
    ).data
  }

  async validateForumProfile() {
    return (await this.fetch<ApiResponse<{ valid: boolean }>>('/user/validate/forum', { method: 'POST', sign: true }))
      .data
  }

  async validateDiscordProfile() {
    return (await this.fetch<ApiResponse<{ valid: boolean }>>('/user/validate/discord', { method: 'POST', sign: true }))
      .data
  }

  async isProfileValidated(address: string, accounts: AccountType[]) {
    const params = new URLSearchParams()
    for (const account of accounts) {
      params.append('account', account)
    }
    return (await this.fetch<ApiResponse<boolean>>(`/user/${address}/is-validated/?${params.toString()}`)).data
  }

  async isDiscordActive() {
    return (await this.fetch<ApiResponse<boolean>>(`/user/discord-active`, { method: 'GET', sign: true })).data
  }

  async isDiscordLinked() {
    return (await this.fetch<ApiResponse<boolean>>(`/user/discord-linked`, { method: 'GET', sign: true })).data
  }

  async updateDiscordStatus(is_discord_notifications_active: boolean) {
    return (
      await this.fetch<ApiResponse<void>>(`/user/discord-active`, {
        method: 'POST',
        sign: true,
        json: { is_discord_notifications_active },
      })
    ).data
  }

  async getUserProfile(address: string) {
    return (
      await this.fetch<ApiResponse<{ forum_id: number | null; forum_username: string | null }>>(`/user/${address}`)
    ).data
  }

  async getBadges(address: string) {
    return (await this.fetch<ApiResponse<UserBadges>>(`/badges/${address}`)).data
  }

  async getCoreUnitsBadges() {
    return (await this.fetch<ApiResponse<GovernanceBadgeSpec[]>>(`/badges/core-units`)).data
  }

  async getBidsInfoOnTender(tenderId: string) {
    return (
      await this.fetch<ApiResponse<{ is_submission_window_finished: boolean; publish_at: string }>>(`/bids/${tenderId}`)
    ).data
  }

  async getUserBidOnTender(tenderId: string) {
    return (
      await this.fetch<
        ApiResponse<Pick<UnpublishedBidAttributes, 'author_address' | 'publish_at' | 'created_at'> | null>
      >(`/bids/${tenderId}/get-user-bid`, { method: 'GET', sign: true })
    ).data
  }

  async getSnapshotConfigAndSpace(spaceName?: string) {
    return (
      await this.fetch<ApiResponse<{ config: SnapshotConfig; space: SnapshotSpace }>>(`/snapshot/config/${spaceName}`)
    ).data
  }

  async getSnapshotStatus() {
    return (await this.fetch<ApiResponse<SnapshotStatus>>(`/snapshot/status`)).data
  }

  async getVotesByAddresses(addresses: string[]) {
    return (
      await this.fetch<ApiResponse<SnapshotVote[]>>(`/snapshot/votes/`, {
        method: 'POST',
        json: { addresses },
      })
    ).data
  }

  async getVotesByProposalFromSnapshot(proposalId: string) {
    return (await this.fetch<ApiResponse<SnapshotVote[]>>(`/snapshot/votes/${proposalId}`)).data
  }

  async getSnapshotProposals(start: Date, end: Date, fields: (keyof SnapshotProposal)[]) {
    return (
      await this.fetch<ApiResponse<Partial<SnapshotProposal>[]>>(`/snapshot/proposals`, {
        method: 'POST',
        json: { start, end, fields },
      })
    ).data
  }

  async getPendingProposals(query: PendingProposalsQuery) {
    return (
      await this.fetch<ApiResponse<Partial<SnapshotProposal>[]>>(`/snapshot/proposals/pending`, {
        method: 'POST',
        json: query,
      })
    ).data
  }

  async getProposalScores(proposalSnapshotId: string) {
    return (await this.fetch<ApiResponse<number[]>>(`/snapshot/proposal-scores/${proposalSnapshotId}`)).data
  }

  async getVpDistribution(address: string, proposalSnapshotId?: string) {
    const snapshotId = proposalSnapshotId ? `/${proposalSnapshotId}` : ''
    const url = `/snapshot/vp-distribution/${address}${snapshotId}`
    return (await this.fetch<ApiResponse<VpDistribution>>(url)).data
  }

  async getScores(addresses: string[]) {
    return (await this.fetch<ApiResponse<DetailedScores>>('/snapshot/scores', { method: 'POST', json: { addresses } }))
      .data
  }

  async getAllVestings() {
    return (await this.fetch<ApiResponse<TransparencyVesting[]>>(`/all-vestings`)).data
  }

  async getVestingContractData(addresses: string[]) {
    return (await this.fetch<ApiResponse<VestingInfo[]>>(`/vesting`, { method: 'POST', json: { addresses } })).data
  }

  async getUpdateComments(update_id: string) {
    return (await this.fetch<ApiResponse<ProposalCommentsInDiscourse>>(`/proposals/${update_id}/update/comments`)).data
  }

  async airdropBadge(badgeSpecCid: string, recipients: string[]) {
    return (
      await this.fetch<ApiResponse<AirdropOutcome>>(`/badges/airdrop/`, {
        method: 'POST',
        sign: true,
        json: {
          badgeSpecCid,
          recipients,
        },
      })
    ).data
  }

  async revokeBadge(badgeSpecCid: string, recipients: string[], reason?: string) {
    return (
      await this.fetch<ApiResponse<RevokeOrReinstateResult[]>>(`/badges/revoke/`, {
        method: 'POST',
        sign: true,
        json: {
          badgeSpecCid,
          recipients,
          reason,
        },
      })
    ).data
  }

  async uploadBadgeSpec(spec: SpecState) {
    return (
      await this.fetch<ApiResponse<BadgeCreationResult>>(`/badges/upload-badge-spec/`, {
        method: 'POST',
        sign: true,
        json: {
          spec,
        },
      })
    ).data
  }

  async createBadgeSpec(badgeCid: string) {
    return (
      await this.fetch<ApiResponse<string>>(`/badges/create-badge-spec/`, {
        method: 'POST',
        sign: true,
        json: {
          badgeCid,
        },
      })
    ).data
  }

  async subscribeToNewsletter(email: string) {
    return (
      await this.fetch<ApiResponse<NewsletterSubscriptionResult>>(`/newsletter-subscribe`, {
        method: 'POST',
        json: {
          email,
        },
      })
    ).data
  }

  async getUserNotifications(address: string) {
    return (await this.fetch<ApiResponse<PushNotification[]>>(`/notifications/user/${address}`)).data
  }

  async sendNotification(recipient: string, title: string, body: string, type: number, url: string) {
    return (
      await this.fetch<ApiResponse<string>>(`/notifications/send`, {
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
    ).data
  }

  async getUserLastNotification() {
    return (
      await this.fetch<ApiResponse<number>>(`/notifications/last-notification`, {
        method: 'GET',
        sign: true,
      })
    ).data
  }

  async updateUserLastNotification(last_notification_id: number) {
    return (
      await this.fetch<ApiResponse<string>>(`/notifications/last-notification`, {
        method: 'POST',
        sign: true,
        json: { last_notification_id },
      })
    ).data
  }

  async getLatestEvents() {
    return (await this.fetch<ApiResponse<ActivityTickerEvent[]>>(`/events`)).data
  }

  async createVoteEvent(proposalId: string, proposalTitle: string, choice: string) {
    return (
      await this.fetch<ApiResponse<string>>(`/events/voted`, {
        method: 'POST',
        sign: true,
        json: { proposalId, proposalTitle, choice },
      })
    ).data
  }

  async getAllEvents() {
    return (await this.fetch<ApiResponse<ActivityTickerEvent[]>>(`/events/all`, { method: 'GET', sign: true })).data
  }

  async getAllAirdropJobs() {
    return (
      await this.fetch<ApiResponse<AirdropJobAttributes[]>>(`/airdrops/all`, {
        method: 'GET',
        sign: true,
      })
    ).data
  }
}
