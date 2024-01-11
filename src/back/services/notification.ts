import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'
import { ethers } from 'ethers'

import { NOTIFICATIONS_SERVICE_ENABLED, PUSH_CHANNEL_ID } from '../../constants'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { proposalUrl } from '../../entities/Proposal/utils'
import UserModel from '../../entities/User/model'
import { inBackground } from '../../helpers'
import { ErrorService } from '../../services/ErrorService'
import { Notification, NotificationCustomType, Recipient } from '../../shared/types/notifications'
import { ErrorCategory } from '../../utils/errorCategories'
import { isProdEnv } from '../../utils/governanceEnvs'
import {
  NotificationBody,
  NotificationTitle,
  NotificationType,
  getCaipAddress,
  getPushNotificationsEnv,
} from '../../utils/notifications'
import { areValidAddresses } from '../utils/validations'

import { CoauthorService } from './coauthor'
import { DiscordService } from './discord'
import { VoteService } from './vote'

import PushAPI = require('@pushprotocol/restapi')

const chainId = isProdEnv() ? ChainId.ETHEREUM_MAINNET : ChainId.ETHEREUM_SEPOLIA
const PUSH_CHANNEL_OWNER_PK = process.env.PUSH_CHANNEL_OWNER_PK
const PUSH_API_URL = process.env.PUSH_API_URL

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

  static async sendNotification({ type, title, body, recipient, url, customType }: Notification) {
    if (!NOTIFICATIONS_SERVICE_ENABLED || !this.signer) {
      return
    }

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

  static grantProposalEnacted(proposal: ProposalAttributes) {
    inBackground(async () => {
      try {
        const coauthors = await CoauthorService.getAllFromProposalId(proposal.id)
        const coauthorsAddresses = coauthors.length > 0 ? coauthors.map((coauthor) => coauthor.address) : []
        const addresses = [proposal.user, ...coauthorsAddresses]

        if (!areValidAddresses(addresses)) {
          throw new Error('Invalid addresses')
        }

        const title = NotificationTitle.GrantEnacted
        const body = NotificationBody.GrantEnacted

        const validatedUsers = await UserModel.getDiscordIdsByAddresses(addresses)
        for (const user of validatedUsers) {
          DiscordService.sendDirectMessage(user.discord_id, {
            title,
            action: body,
            url: proposalUrl(proposal.id),
            fields: [],
          })
        }

        return await this.sendNotification({
          title,
          body,
          recipient: addresses,
          url: proposalUrl(proposal.id),
          customType: NotificationCustomType.Grant,
        })
      } catch (error) {
        ErrorService.report('Error sending proposal enacted notification', {
          error,
          category: ErrorCategory.Notifications,
          proposal,
        })
      }
    })
  }

  static async coAuthorRequested(proposal: ProposalAttributes, coAuthors: string[]) {
    try {
      if (!areValidAddresses(coAuthors)) {
        throw new Error('Invalid addresses')
      }

      const title = NotificationTitle.CoAuthorRequestReceived
      const body = NotificationBody.CoAuthorRequestReceived

      const validatedUsers = await UserModel.getDiscordIdsByAddresses(coAuthors)
      for (const user of validatedUsers) {
        DiscordService.sendDirectMessage(user.discord_id, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })
      }

      return await this.sendNotification({
        title,
        body,
        recipient: coAuthors,
        url: proposalUrl(proposal.id),
        customType: NotificationCustomType.Proposal,
      })
    } catch (error) {
      ErrorService.report('Error sending co-author request notification', {
        error,
        category: ErrorCategory.Notifications,
        proposal,
      })
    }
  }

  static async votingEndedAuthors(proposal: ProposalAttributes) {
    try {
      const coauthors = await CoauthorService.getAllFromProposalId(proposal.id)
      const coauthorsAddresses = coauthors.length > 0 ? coauthors.map((coauthor) => coauthor.address) : []
      const addresses = [proposal.user, ...coauthorsAddresses]

      if (!areValidAddresses(addresses)) {
        throw new Error('Invalid addresses')
      }

      const title = `${NotificationTitle.ProposalVotedFinished} ${proposal.title}`
      const body = NotificationBody.ProposalVotedFinished

      const validatedUsers = await UserModel.getDiscordIdsByAddresses(addresses)
      for (const user of validatedUsers) {
        DiscordService.sendDirectMessage(user.discord_id, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })
      }

      return await this.sendNotification({
        title,
        body,
        recipient: addresses,
        url: proposalUrl(proposal.id),
        customType: NotificationCustomType.Proposal,
      })
    } catch (error) {
      ErrorService.report('Error sending voting ended notification to authors', {
        error,
        category: ErrorCategory.Notifications,
        proposal,
      })
    }
  }

  static async votingEndedVoters(proposal: ProposalAttributes, addresses: string[]) {
    try {
      if (!areValidAddresses(addresses)) {
        throw new Error('Invalid addresses')
      }

      const title = NotificationTitle.ProposalVotedFinished
      const body = NotificationBody.ProposalVotedFinished

      const validatedUsers = await UserModel.getDiscordIdsByAddresses(addresses)
      for (const user of validatedUsers) {
        DiscordService.sendDirectMessage(user.discord_id, {
          title,
          action: body,
          url: proposalUrl(proposal.id),
          fields: [],
        })
      }

      return await this.sendNotification({
        title,
        body,
        recipient: addresses,
        url: proposalUrl(proposal.id),
        customType: NotificationCustomType.Proposal,
      })
    } catch (error) {
      ErrorService.report('Error sending voting ended notification to voters', {
        error,
        category: ErrorCategory.Notifications,
        proposal,
      })
    }
  }

  static sendFinishProposalNotifications(proposals: ProposalAttributes[]) {
    if (NOTIFICATIONS_SERVICE_ENABLED) {
      inBackground(async () => {
        for (const proposal of proposals) {
          try {
            await this.votingEndedAuthors(proposal)
            const votes = await VoteService.getVotes(proposal.id)
            const voters = Object.keys(votes)
            await this.votingEndedVoters(proposal, voters)
          } catch (error) {
            logger.log('Error sending notifications on proposal finish', { proposalId: proposal.id })
          }
        }
      })
    }
  }
}
