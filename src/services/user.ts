import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

import { PUSH_CHANNEL_ID } from '../constants'
import { isSameAddress } from '../entities/Snapshot/utils'
import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import UserModel from '../entities/User/model'
import { AccountType, UserAttributes, ValidationComment, ValidationMessage } from '../entities/User/types'
import { formatValidationMessage, getValidationComment, toAccountType, validateComment } from '../entities/User/utils'
import { DiscourseService } from '../services/DiscourseService'
import { ErrorService } from '../services/ErrorService'
import { isProdEnv } from '../utils/governanceEnvs'
import { getCaipAddress, getPushNotificationsEnv } from '../utils/notifications'

import { DiscordService } from './discord'

import PushAPI = require('@pushprotocol/restapi')

export class UserService {
  private static VALIDATIONS_IN_PROGRESS: Record<string, ValidationMessage> = {}

  private static clearValidationInProgress(user: string) {
    const validation = this.VALIDATIONS_IN_PROGRESS[user]
    if (validation) {
      clearTimeout(validation.message_timeout)
      delete this.VALIDATIONS_IN_PROGRESS[user]
    }
  }

  static getValidationMessage(address: string, account?: string) {
    const timestamp = new Date().toISOString()
    const message_timeout = setTimeout(() => {
      delete this.VALIDATIONS_IN_PROGRESS[address]
    }, MESSAGE_TIMEOUT_TIME)

    this.VALIDATIONS_IN_PROGRESS[address] = {
      address,
      timestamp,
      message_timeout,
    }

    return formatValidationMessage(address, timestamp, toAccountType(account))
  }

  static async validateForumUser(user: string) {
    try {
      const comments = await DiscourseService.getPostComments(Number(GATSBY_DISCOURSE_CONNECT_THREAD))
      const formattedComments = comments.comments.map<ValidationComment>((comment) => ({
        id: '',
        userId: String(comment.user_forum_id),
        content: comment.cooked,
        timestamp: new Date(comment.created_at).getTime(),
      }))

      const validationComment = await this.checkForumValidationMessage(user, formattedComments)
      return {
        valid: !!validationComment,
      }
    } catch (error) {
      throw new Error("Couldn't validate the user. " + error)
    }
  }

  static async checkForumValidationMessage(user: string, validationComments: ValidationComment[]) {
    const messageProperties = this.VALIDATIONS_IN_PROGRESS[user]
    if (!messageProperties) {
      throw new Error('Validation timed out')
    }

    const { address, timestamp } = messageProperties

    const validationComment = getValidationComment(validationComments, address, timestamp)

    if (validationComment) {
      if (!isSameAddress(address, user) || !validateComment(validationComment, address, timestamp, AccountType.Forum)) {
        throw new Error('Validation failed')
      }

      await UserModel.createForumConnection(user, validationComment.userId)
      this.clearValidationInProgress(user)
    }

    return validationComment
  }

  static async validateDiscordUser(user: string) {
    try {
      const messages = await DiscordService.getProfileVerificationMessages()
      const formattedMessages = messages.map<ValidationComment>((message) => ({
        id: message.id,
        userId: message.author.id,
        content: message.content,
        timestamp: message.createdTimestamp,
      }))

      const validationComment = await this.checkDiscordValidationMessage(user, formattedMessages)
      if (validationComment) {
        await DiscordService.deleteVerificationMessage(validationComment.id)
        DiscordService.sendDirectMessage(validationComment.userId, {
          title: 'Profile verification completed ✅',
          action: `You have been verified as ${user}\n\nFrom now on you will receive important notifications for you through this channel.`,
          fields: [],
        })
      }

      return {
        valid: !!validationComment,
      }
    } catch (error) {
      throw new Error("Couldn't validate the user. " + error)
    }
  }
  static async checkDiscordValidationMessage(user: string, validationComments: ValidationComment[]) {
    const messageProperties = this.VALIDATIONS_IN_PROGRESS[user]
    if (!messageProperties) {
      throw new Error('Validation timed out')
    }
    const { address, timestamp } = messageProperties

    const validationComment = getValidationComment(validationComments, address, timestamp)

    if (validationComment) {
      if (
        !isSameAddress(address, user) ||
        !validateComment(validationComment, address, timestamp, AccountType.Discord)
      ) {
        throw new Error('Validation failed')
      }
      await UserModel.createDiscordConnection(user, validationComment.userId)
      this.clearValidationInProgress(user)
    }

    return validationComment
  }

  static async updateDiscordActiveStatus(address: string, is_discord_notifications_active: boolean) {
    await UserModel.updateDiscordActiveStatus(address, is_discord_notifications_active)
    const account = await UserModel.getDiscordIds([address])
    return account.length > 0 ? account[0] : null
  }

  static async updateDiscordStatus(address: string, isDiscordNotificationsActive: boolean) {
    try {
      const account = await this.updateDiscordActiveStatus(address, isDiscordNotificationsActive)
      if (account) {
        if (account.is_discord_notifications_active) {
          const enabledMessage =
            'You have enabled the notifications through Discord, from now on you will receive notifications that may concern you through this channel.'
          DiscordService.sendDirectMessage(account.discord_id, {
            title: 'Notifications enabled ✅',
            action: enabledMessage,
            fields: [],
          })
        } else {
          const disabledMessage =
            'You have disabled the notifications through Discord, from now on you will no longer receive notifications through this channel.'
          DiscordService.sendDirectMessage(account.discord_id, {
            title: 'Notifications disabled ❌',
            action: disabledMessage,
            fields: [],
          })
        }
      }
    } catch (error) {
      throw new Error(`Error while updating discord status. ${error}`)
    }
  }

  static async getIsDiscordActive(address: string) {
    try {
      const account = await UserModel.getDiscordIds([address])
      return account.length > 0 ? account[0].is_discord_notifications_active : false
    } catch (error) {
      throw new Error(`Error while fetching discord status. ${error}`)
    }
  }

  static async isDiscordLinked(address: string) {
    try {
      return await UserModel.isValidated(address, new Set([AccountType.Discord]))
    } catch (error) {
      throw new Error(`Error while fetching discord status. ${error}`)
    }
  }

  static async isValidated(address: string, accounts: Set<AccountType>): Promise<boolean> {
    try {
      if (!accounts.has(AccountType.Push)) {
        return await UserModel.isValidated(address, accounts)
      }

      const chainId = isProdEnv() ? ChainId.ETHEREUM_MAINNET : ChainId.ETHEREUM_SEPOLIA
      const env = getPushNotificationsEnv(chainId)

      const pushSubscriptions = await PushAPI.user.getSubscriptions({
        user: getCaipAddress(address, chainId),
        env,
      })

      const isSubscribedToPush = !!pushSubscriptions?.find((item: { channel: string }) =>
        isSameAddress(item.channel, PUSH_CHANNEL_ID)
      )
      accounts.delete(AccountType.Push)

      if (accounts.size === 0) {
        return isSubscribedToPush
      }
      return isSubscribedToPush && (await UserModel.isValidated(address, accounts))
    } catch (error) {
      const message = 'Error while fetching validation data'
      ErrorService.report(message, { error: `${error}` })
      throw new Error(`${message}. ${error}`)
    }
  }

  static async getProfile(address: string) {
    try {
      const user = await UserModel.findOne<UserAttributes>({ address: address.toLowerCase() })
      if (!user) {
        const emptyProfile: UserAttributes = { address }
        return emptyProfile
      }
      const { forum_id } = user

      return {
        forum_id,
        forum_username: forum_id ? (await DiscourseService.getUserById(forum_id))?.username : null,
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error while fetching profile data: ${error.message}. Stack: ${error.stack}`)
      } else {
        throw new Error(`Unexpected error while fetching profile data ${error}`)
      }
    }
  }
}
