import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import { ethers } from 'ethers'

import { SnapshotSubgraph } from '../clients/SnapshotSubgraph'
import { DCL_NOTIFICATIONS_SERVICE_ENABLED, NOTIFICATIONS_SERVICE_ENABLED, PUSH_CHANNEL_ID } from '../constants'
import ProposalModel from '../entities/Proposal/model'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { proposalUrl } from '../entities/Proposal/utils'
import { isSameAddress } from '../entities/Snapshot/utils'
import { getUpdateUrl } from '../entities/Updates/utils'
import { inBackground } from '../helpers'
import { ErrorService } from '../services/ErrorService'
import { ProjectUpdateCommentedEvent, ProposalCommentedEvent } from '../shared/types/events'
import { DclNotification, Notification, NotificationCustomType, Recipient } from '../shared/types/notifications'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'
import { NotificationType, Notifications, getCaipAddress, getPushNotificationsEnv } from '../utils/notifications'
import { areValidAddresses } from '../utils/validations'

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
          type: 'governance_proposal_enacted',
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
          this.sendDCLNotifications(dclNotifications),
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
          type: 'governance_coauthor_requested',
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
          this.sendDCLNotifications(dclNotifications),
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
          type: 'governance_pitch_passed',
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
          this.sendDCLNotifications(dclNotifications),
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

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: 'governance_tender_passed',
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.TenderPassed.title(proposal),
            description: Notifications.TenderPassed.body,
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
            customType: NotificationCustomType.TenderPassed,
          }),
          this.sendDCLNotifications(dclNotifications),
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

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: 'governance_authored_proposal_finished',
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.ProposalAuthoredFinished.title(proposal),
            description: Notifications.ProposalAuthoredFinished.body,
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
            customType: NotificationCustomType.Proposal,
          }),
          this.sendDCLNotifications(dclNotifications),
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

        DiscordService.sendDirectMessages(addresses, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: 'governance_voting_ended_voter',
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.ProposalVotedFinished.title(proposal),
            description: Notifications.ProposalVotedFinished.body,
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
            customType: NotificationCustomType.Proposal,
          }),
          this.sendDCLNotifications(dclNotifications),
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

        DiscordService.sendDirectMessages(addresses, {
          title: Notifications.ProposalCommented.title(proposal),
          action: Notifications.ProposalCommented.body,
          url: proposalUrl(proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: 'governance_new_comment_on_proposal',
          address,
          eventKey: proposal.id,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.ProposalCommented.title(proposal),
            description: Notifications.ProposalCommented.body,
            link: proposalUrl(proposal.id),
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title: Notifications.ProposalCommented.title(proposal),
            body: Notifications.ProposalCommented.body,
            recipient: addresses,
            url: proposalUrl(proposal.id),
            customType: NotificationCustomType.ProposalComment,
          }),
          this.sendDCLNotifications(dclNotifications),
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

        DiscordService.sendDirectMessages(addresses, {
          title: Notifications.ProjectUpdateCommented.title(proposal),
          action: Notifications.ProjectUpdateCommented.body,
          url: getUpdateUrl(updateId, proposal.id),
          fields: [],
        })

        const dclNotifications = addresses.map((address) => ({
          type: 'governance_new_comment_on_project_update',
          address,
          eventKey: updateId,
          metadata: {
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            title: Notifications.ProjectUpdateCommented.title(proposal),
            description: Notifications.ProjectUpdateCommented.body,
            link: getUpdateUrl(updateId, proposal.id),
          },
          timestamp: Date.now(),
        }))

        await Promise.all([
          this.sendPushNotification({
            title: Notifications.ProjectUpdateCommented.title(proposal),
            body: Notifications.ProjectUpdateCommented.body,
            recipient: addresses,
            url: getUpdateUrl(updateId, proposal.id),
            customType: NotificationCustomType.ProjectUpdateComment,
          }),
          this.sendDCLNotifications(dclNotifications),
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
          type: 'governance_whale_vote',
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
          this.sendDCLNotifications(dclNotifications),
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
          type: 'governance_voted_on_behalf',
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
          this.sendDCLNotifications(dclNotifications),
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
}
