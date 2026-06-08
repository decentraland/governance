import { Events } from '@dcl/schemas'
import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ethers } from 'ethers'

import { SnapshotSubgraph } from '../clients/SnapshotSubgraph'
import {
  DCL_NOTIFICATIONS_SERVICE_ENABLED,
  NOTIFICATIONS_SERVICE_ENABLED,
  PUSH_CHANNEL_ID,
  getVestingContractUrl,
} from '../constants'
import ProposalModel from '../entities/Proposal/model'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import { ProposalAttributes, ProposalContributors, ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { proposalUrl } from '../entities/Proposal/utils'
import { isSameAddress } from '../entities/Snapshot/utils'
import { getUpdateUrl } from '../entities/Updates/utils'
import { inBackground } from '../helpers'
import { ProjectUpdateCommentedEvent, ProposalCommentedEvent } from '../shared/types/events'
import { DclNotification, Notification, NotificationCustomType, Recipient } from '../shared/types/notifications'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'
import { NotificationType, Notifications, getCaipAddress, getPushNotificationsEnv } from '../utils/notifications'
import { PublishableEvent, createSnsPublisher } from '../utils/sns/sns'
import { areValidAddresses } from '../utils/validations'

import { ErrorService } from './ErrorService'
import { ProposalService } from './ProposalService'
import { SnapshotService } from './SnapshotService'
import { CoauthorService } from './coauthor'
import { DiscordService } from './discord'
import { VoteService } from './vote'

import PushAPI = require('@pushprotocol/restapi')

const chainId = isProdEnv() ? ChainId.ETHEREUM_MAINNET : ChainId.ETHEREUM_SEPOLIA
const PUSH_CHANNEL_OWNER_PK = process.env.PUSH_CHANNEL_OWNER_PK
const PUSH_API_URL = process.env.PUSH_API_URL
const DCL_NOTIFICATIONS_SERVICE_API_URL = process.env.DCL_NOTIFICATIONS_SERVICE_API_URL
const DCL_NOTIFICATIONS_SERVICE_API_TOKEN = process.env.DCL_NOTIFICATIONS_SERVICE_API_TOKEN

// Initialize SNS publisher
let snsPublisher: ReturnType<typeof createSnsPublisher> | null = null
function getSnsPublisher() {
  if (!snsPublisher) {
    try {
      snsPublisher = createSnsPublisher()
    } catch (error) {
      logger.error('Failed to initialize SNS publisher', { error: `${error}` })
      return null
    }
  }
  return snsPublisher
}

function getSigner() {
  if (!NOTIFICATIONS_SERVICE_ENABLED) {
    return undefined
  }
  if (!PUSH_CHANNEL_OWNER_PK || !ethers.utils.isHexString(`0x${PUSH_CHANNEL_OWNER_PK}`, 32)) {
    logger.error(
      'PUSH_CHANNEL_OWNER_PK env var is invalid or missing. You can either add a valid one or set NOTIFICATIONS_SERVICE_ENABLED=false'
    )
    return undefined
  }
  return new ethers.Wallet(`0x${PUSH_CHANNEL_OWNER_PK}`)
}

const NotificationIdentityType = {
  DIRECT_PAYLOAD: 2,
}
const ADDITIONAL_META_CUSTOM_TYPE = 0
const ADDITIONAL_META_CUSTOM_TYPE_VERSION = 1

export class NotificationService {
  static signer = getSigner()

  private static async getAuthorAndCoauthors(proposal: ProposalAttributes) {
    const coauthors = await CoauthorService.getAllFromProposalId(proposal.id)
    const coauthorsAddresses = coauthors.length > 0 ? coauthors.map((coauthor) => coauthor.address.toLowerCase()) : []
    const addresses = [proposal.user.toLowerCase(), ...coauthorsAddresses]

    if (!areValidAddresses(addresses)) {
      throw new Error('Invalid addresses')
    }

    return addresses
  }

  static async sendPushNotification({ type, title, body, recipient, url, customType }: Notification) {
    if (!NOTIFICATIONS_SERVICE_ENABLED || !this.signer) {
      logger.warn('Push notification service is disabled')
      return
    }

    try {
      const response = await PushAPI.payloads.sendNotification({
        signer: this.signer,
        type: this.getType(type, recipient),
        identityType: NotificationIdentityType.DIRECT_PAYLOAD,
        notification: {
          title,
          body,
        },
        payload: {
          title,
          body,
          cta: url,
          img: '',
          additionalMeta: {
            type: `${ADDITIONAL_META_CUSTOM_TYPE}+${ADDITIONAL_META_CUSTOM_TYPE_VERSION}`,
            data: JSON.stringify({
              customType,
            }),
          },
        },

        recipients: this.getRecipients(recipient),
        channel: getCaipAddress(PUSH_CHANNEL_ID, chainId),
        env: getPushNotificationsEnv(chainId),
      })

      return response.data
    } catch (error) {
      ErrorService.report('Error sending push notification', {
        error: `${error}`,
        category: ErrorCategory.Notifications,
        type,
        title,
        body,
        recipient,
        url,
      })
    }
  }

  static async sendDCLNotifications(notifications: DclNotification[]) {
    if (!DCL_NOTIFICATIONS_SERVICE_ENABLED) {
      logger.warn('DCL notification service is disabled')
      return
    }

    try {
      await fetch(`${DCL_NOTIFICATIONS_SERVICE_API_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DCL_NOTIFICATIONS_SERVICE_API_TOKEN}`,
        },
        body: JSON.stringify(notifications),
      })
    } catch (error) {
      ErrorService.report('Failed to send notification to DCL', {
        error: `${error}`,
        category: ErrorCategory.Notifications,
        notifications,
      })
    }
  }

  private static convertToPublishableEvent(dclNotification: DclNotification): PublishableEvent {
    const baseEvent = {
      type: Events.Type.GOVERNANCE as const,
      key: dclNotification.eventKey,
      timestamp: dclNotification.timestamp,
    }

    // Type assertion for metadata to access properties
    const metadata = dclNotification.metadata as {
      proposalId: string
      proposalTitle: string
      title: string
      description: string
      link: string
    }

    // Map DCL notification types to proper event structures
    switch (dclNotification.type) {
      case Events.SubType.Governance.PROPOSAL_ENACTED:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.PROPOSAL_ENACTED,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.COAUTHOR_REQUESTED:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.COAUTHOR_REQUESTED,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.PITCH_PASSED:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.PITCH_PASSED,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.TENDER_PASSED:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.TENDER_PASSED,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.AUTHORED_PROPOSAL_FINISHED:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.AUTHORED_PROPOSAL_FINISHED,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.VOTING_ENDED_VOTER:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.VOTING_ENDED_VOTER,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.NEW_COMMENT_ON_PROPOSAL:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.NEW_COMMENT_ON_PROPOSAL,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.NEW_COMMENT_ON_PROJECT_UPDATED:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.NEW_COMMENT_ON_PROJECT_UPDATED,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.WHALE_VOTE:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.WHALE_VOTE,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.VOTED_ON_BEHALF:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.VOTED_ON_BEHALF,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      case Events.SubType.Governance.CLIFF_ENDED:
        return {
          ...baseEvent,
          subType: Events.SubType.Governance.CLIFF_ENDED,
          metadata: {
            proposalId: metadata.proposalId,
            proposalTitle: metadata.proposalTitle,
            title: metadata.title,
            description: metadata.description,
            link: metadata.link,
            address: dclNotification.address || '',
          },
        }
      default:
        throw new Error(`Unknown notification type: ${dclNotification.type}`)
    }
  }

  static async sendDCLEvent(events: DclNotification[]) {
    const publisher = getSnsPublisher()
    if (!publisher) {
      logger.warn('SNS publisher is not available')
      return
    }

    try {
      const publishableEvents = events.map((event) => this.convertToPublishableEvent(event))
      const result = await publisher.publishMessages(publishableEvents)

      if (result.failedEvents.length > 0) {
        logger.warn('Some events failed to publish via SNS', {
          failedCount: result.failedEvents.length,
          successfulCount: result.successfulMessageIds.length,
        })
      } else {
        logger.log('Successfully published events via SNS', {
          count: result.successfulMessageIds.length,
        })
      }
    } catch (error) {
      ErrorService.report('Failed to send events via SNS', {
        error: `${error}`,
        category: ErrorCategory.Notifications,
        eventsCount: events.length,
      })
    }
  }

  private static getType(type: number | undefined, recipient: Recipient) {
    if (type) {
      return type
    }

    if (!recipient) {
      return NotificationType.BROADCAST
    }

    if (Array.isArray(recipient)) {
      return NotificationType.SUBSET
    }

    return NotificationType.TARGET
  }

  private static getRecipients(recipient: Recipient) {
    if (!recipient) {
      return undefined
    }

    if (Array.isArray(recipient)) {
      return recipient.map((item: string) => getCaipAddress(item, chainId))
    }

    return getCaipAddress(recipient, chainId)
  }

  static async getUserFeed(address: string) {
    try {
      const response = await fetch(
        `${PUSH_API_URL}/apis/v1/users/${getCaipAddress(address, chainId)}/channels/${getCaipAddress(
          PUSH_CHANNEL_ID,
          chainId
        )}/feeds`
      )

      return (await response.json()).feeds
    } catch (error) {
      throw new Error('Error getting user feed')
    }
  }

  static projectProposalEnacted(proposal: ProposalAttributes) {
    inBackground(async () => {
      try {
        const addresses = await this.getAuthorAndCoauthors(proposal)

        const title = Notifications.ProjectEnacted.title
        const body = Notifications.ProjectEnacted.body

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.PROPOSAL_ENACTED,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.ProjectEnacted.title,
            description: Notifications.ProjectEnacted.body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url: proposalUrl(proposal.id),
            customType: NotificationCustomType.Grant,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending proposal enacted notification', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static coAuthorRequested(proposal: ProposalAttributes, coAuthors: string[]) {
    inBackground(async () => {
      try {
        if (!areValidAddresses(coAuthors)) {
          throw new Error('Invalid addresses')
        }

        const title = Notifications.CoAuthorRequestReceived.title
        const body = Notifications.CoAuthorRequestReceived.body

        DiscordService.sendDirectMessages(coAuthors, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = coAuthors.map((address) => ({
          type: Events.SubType.Governance.COAUTHOR_REQUESTED,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.CoAuthorRequestReceived.title,
            description: Notifications.CoAuthorRequestReceived.body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: coAuthors,
            url: proposalUrl(proposal.id),
            customType: NotificationCustomType.Proposal,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending co-author request notification', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static async pitchPassed(proposal: ProposalAttributes, addresses: string[]) {
    inBackground(async () => {
      try {
        if (!areValidAddresses(addresses)) {
          throw new Error('Invalid addresses')
        }

        const title = Notifications.PitchPassed.title(proposal)
        const body = Notifications.PitchPassed.body

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.PITCH_PASSED,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.PitchPassed.title(proposal),
            description: Notifications.PitchPassed.body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url: proposalUrl(proposal.id),
            customType: NotificationCustomType.PitchPassed,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending pitch passed notification', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static async tenderPassed(proposal: ProposalAttributes, addresses: string[]) {
    inBackground(async () => {
      try {
        if (!areValidAddresses(addresses)) {
          throw new Error('Invalid addresses')
        }

        const title = Notifications.TenderPassed.title(proposal)
        const body = Notifications.TenderPassed.body
        const url = proposalUrl(proposal.id)

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url,
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.TENDER_PASSED,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: title,
            description: body,
            link: url,
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url,
            customType: NotificationCustomType.TenderPassed,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending tender passed notification', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static async authoredProposalFinished(proposal: ProposalAttributes, addresses: string[]) {
    inBackground(async () => {
      try {
        const title = Notifications.ProposalAuthoredFinished.title(proposal)
        const body = Notifications.ProposalAuthoredFinished.body
        const url = proposalUrl(proposal.id)

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: url,
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.AUTHORED_PROPOSAL_FINISHED,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: title,
            description: body,
            link: url,
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url,
            customType: NotificationCustomType.Proposal,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending voting ended notification to authors', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static votingEndedVoters(proposal: ProposalAttributes, addresses: string[]) {
    inBackground(async () => {
      try {
        if (!areValidAddresses(addresses)) {
          throw new Error('Invalid addresses')
        }

        const title = Notifications.ProposalVotedFinished.title(proposal)
        const body = Notifications.ProposalVotedFinished.body
        const url = proposalUrl(proposal.id)

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url,
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.VOTING_ENDED_VOTER,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title,
            description: body,
            link: url,
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url,
            customType: NotificationCustomType.Proposal,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending voting ended notification to voters', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static sendFinishProposalNotifications(proposals: ProposalWithOutcome[]) {
    if (NOTIFICATIONS_SERVICE_ENABLED) {
      inBackground(async () => {
        for (const proposal of proposals) {
          try {
            const authorAndCoauthors = new Set(await this.getAuthorAndCoauthors(proposal))
            const votes = await VoteService.getVotes(proposal.id)
            const voters = Object.keys(votes).filter((voter) => !authorAndCoauthors.has(voter.toLowerCase()))

            if (proposal.type === ProposalType.Pitch && proposal.newStatus === ProposalStatus.Passed) {
              this.pitchPassed(proposal, [...voters, ...Array.from(authorAndCoauthors)])
            } else if (proposal.type === ProposalType.Tender && proposal.newStatus === ProposalStatus.Passed) {
              this.tenderPassed(proposal, [...voters, ...Array.from(authorAndCoauthors)])
            } else {
              this.authoredProposalFinished(proposal, Array.from(authorAndCoauthors))
              this.votingEndedVoters(proposal, voters)
            }
          } catch (error) {
            ErrorService.report('Error sending notifications on proposal finish', {
              error: `${error}`,
              category: ErrorCategory.Notifications,
              proposalId: proposal.id,
            })
          }
        }
      })
    }
  }

  static newCommentOnProposal(commentEvent: ProposalCommentedEvent) {
    inBackground(async () => {
      const proposalId = commentEvent.event_data.proposal_id
      try {
        const proposal = await ProposalModel.getProposal(proposalId)
        const addresses = await this.getAuthorAndCoauthors(proposal)

        const title = Notifications.ProposalCommented.title(proposal)
        const body = Notifications.ProposalCommented.body
        const url = proposalUrl(proposal.id)

        DiscordService.sendDirectMessages(addresses, {
          title: title,
          action: body,
          url,
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.NEW_COMMENT_ON_PROPOSAL,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title,
            description: body,
            link: url,
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url: url,
            customType: NotificationCustomType.ProposalComment,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending notifications for new comment on proposal', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal_id: proposalId,
          event: commentEvent,
        })
      }
    })
  }

  static newCommentOnProjectUpdate(commentEvent: ProjectUpdateCommentedEvent) {
    inBackground(async () => {
      const proposalId = commentEvent.event_data.proposal_id
      const updateId = commentEvent.event_data.update_id
      try {
        const proposal = await ProposalModel.getProposal(proposalId)
        const addresses = await this.getAuthorAndCoauthors(proposal)
        const title = Notifications.ProjectUpdateCommented.title(proposal)
        const body = Notifications.ProjectUpdateCommented.body
        const updateUrl = getUpdateUrl(updateId, proposal.id)

        DiscordService.sendDirectMessages(addresses, {
          title: title,
          action: body,
          url: updateUrl,
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.NEW_COMMENT_ON_PROJECT_UPDATED,
          address,
          eventKey: updateId,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title,
            description: body,
            link: updateUrl,
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url: updateUrl,
            customType: NotificationCustomType.ProjectUpdateComment,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending notifications for new comment on project update', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal_id: proposalId,
          update_id: updateId,
          event: commentEvent,
        })
      }
    })
  }

  static async newVote(proposalId: ProposalAttributes['id'], voterAddress: string) {
    inBackground(async () => {
      const proposal = await ProposalService.getProposal(proposalId)
      const votes = await SnapshotService.getVotesByProposal(proposal.snapshot_id)
      const addressVote = votes.find((vote) => isSameAddress(vote.voter, voterAddress))

      if ((addressVote?.vp || 0) >= Number(process.env.WHALE_VOTE_THRESHOLD)) {
        this.whaleVote(proposal)
      }

      const delegators = await SnapshotSubgraph.get().getDelegates('delegatedFrom', {
        address: voterAddress,
        space: proposal.snapshot_space,
        blockNumber: proposal.snapshot_proposal.snapshot,
      })
      if (delegators.length === 0) {
        return
      }

      const votesAddresses = votes.map((vote) => vote.voter)
      const delegatorsWhoVoted = votesAddresses.filter((vote) =>
        delegators.some((delegator) => delegator.delegator === vote)
      )
      if (delegatorsWhoVoted.length > 0) {
        this.votedOnBehalf(proposal, delegatorsWhoVoted)
      }
    })
  }

  private static whaleVote(proposal: ProposalAttributes) {
    inBackground(async () => {
      try {
        const addresses = await this.getAuthorAndCoauthors(proposal)
        const title = Notifications.WhaleVote.title(proposal)
        const body = Notifications.WhaleVote.body

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.WHALE_VOTE,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title,
            description: body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url: proposalUrl(proposal.id),
            customType: NotificationCustomType.WhaleVote,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending notifications for whale vote', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal_id: proposal.id,
        })
      }
    })
  }

  private static votedOnBehalf(proposal: ProposalAttributes, addresses: string[]) {
    inBackground(async () => {
      try {
        const title = Notifications.VotedOnYourBehalf.title(proposal)
        const body = Notifications.VotedOnYourBehalf.body

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: Events.SubType.Governance.VOTED_ON_BEHALF,
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title,
            description: body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title,
            body,
            recipient: addresses,
            url: proposalUrl(proposal.id),
            customType: NotificationCustomType.VotedOnBehalf,
          }),
          this.sendDCLEvent(dclNotifications),
        ])
      } catch (error) {
        ErrorService.report('Error sending notifications for delegated vote', {
          error: `${error}`,
          category: ErrorCategory.Notifications,
          proposal_id: proposal.id,
        })
      }
    })
  }

  static async cliffEnded(proposalsWithContributors: ProposalContributors[]) {
    inBackground(async () => {
      proposalsWithContributors.map(async (proposalWithContributors) => {
        try {
          const { id: proposal_id } = proposalWithContributors
          const addresses = getUniqueContributors(proposalWithContributors)

          const title = Notifications.CliffEnded.title(proposalWithContributors.title)
          const body = Notifications.CliffEnded.body
          const latestVestingAddress =
            proposalWithContributors.vesting_addresses[proposalWithContributors.vesting_addresses.length - 1]
          const url = getVestingContractUrl(latestVestingAddress)

          DiscordService.sendDirectMessages(addresses, {
            title,
            action: body,
            url,
            fields: [],
          })

          const dclNotifications = addresses.map((address) => ({
            type: Events.SubType.Governance.CLIFF_ENDED,
            address,
            eventKey: proposal_id,
            metadata: {
              proposalId: proposal_id,
              proposalTitle: title,
              title: title,
              description: body,
              link: url,
            },
            timestamp: Date.now(),
          }))

          await Promise.all([
            this.sendPushNotification({
              title,
              body,
              recipient: addresses,
              url,
              customType: NotificationCustomType.Proposal,
            }),
            this.sendDCLEvent(dclNotifications),
          ])
        } catch (error) {
          ErrorService.report('Error sending cliff ended notification to proposal contributors', {
            error: `${error}`,
            category: ErrorCategory.Notifications,
            proposalsWithContributors,
          })
        }
      })
    })
  }
}

function getUniqueContributors(proposalContributors: ProposalContributors) {
  const { user, coauthors, configuration } = proposalContributors
  const addressesSet = new Set<string>()
  addressesSet.add(user)
  if (!!coauthors && coauthors.length > 0) {
    coauthors.forEach((coAuthor) => addressesSet.add(coAuthor))
  }
  if (configuration.beneficiary) addressesSet.add(configuration.beneficiary)
  return Array.from(addressesSet)
}
