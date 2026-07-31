import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import capitalize from 'lodash/capitalize'

import { PUSH_CHANNEL_ID } from '../constants'
import { isSameAddress } from '../entities/Snapshot/utils'
import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import UserModel from '../entities/User/model'
import { AccountType, UserAttributes, UserProfile, ValidationComment, ValidationMessage } from '../entities/User/types'
import {
  AmbiguousValidationError,
  ValidationTimeoutError,
  formatValidationMessage,
  getValidationComment,
} from '../entities/User/utils'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'
import { getCaipAddress, getPushNotificationsEnv } from '../utils/notifications'

import { DiscourseService, IncompleteDiscourseCommentsError } from './DiscourseService'
import { ErrorService } from './ErrorService'
import { DiscordService, IncompleteDiscordVerificationReadError } from './discord'

import PushAPI = require('@pushprotocol/restapi')

export class UserService {
  private static VALIDATIONS_IN_PROGRESS: Record<string, ValidationMessage> = {}

  // Keyed by account as well as address so opening one flow does not cancel the other.
  private static validationKey(address: string, account: AccountType) {
    return `${address.toLowerCase()}:${account}`
  }

  private static clearValidationInProgress(address: string, account: AccountType) {
    const key = this.validationKey(address, account)
    const validation = this.VALIDATIONS_IN_PROGRESS[key]
    if (validation) {
      clearTimeout(validation.message_timeout)
      delete this.VALIDATIONS_IN_PROGRESS[key]
    }
  }

  static getValidationMessage(address: string, account: AccountType) {
    // Discard any window already open for this pair, otherwise its timer fires later and expires
    // the window opened here instead of the one it was scheduled for.
    this.clearValidationInProgress(address, account)

    const timestamp = new Date().toISOString()
    const key = this.validationKey(address, account)
    const message_timeout = setTimeout(() => {
      delete this.VALIDATIONS_IN_PROGRESS[key]
    }, MESSAGE_TIMEOUT_TIME)

    this.VALIDATIONS_IN_PROGRESS[key] = {
      address,
      timestamp,
      account,
      message_timeout,
    }

    return formatValidationMessage(address, timestamp, account)
  }

  static async validateForumUser(user: string) {
    try {
      const comments = await DiscourseService.getPostComments(Number(GATSBY_DISCOURSE_CONNECT_THREAD), {
        requireComplete: true,
      })
      const formattedComments = comments.comments.map<ValidationComment>((comment) => ({
        id: '',
        // Left empty rather than stringified when absent, so 'undefined' does not become an author
        // id that several unattributable comments appear to share.
        userId: comment.user_forum_id != null ? String(comment.user_forum_id) : '',
        content: comment.cooked,
        timestamp: new Date(comment.created_at).getTime(),
      }))

      const validationComment = await this.checkForumValidationMessage(user, formattedComments)
      return {
        valid: !!validationComment,
      }
    } catch (error) {
      this.handleValidationError(error, user, AccountType.Forum)
    }
  }

  static async checkForumValidationMessage(user: string, validationComments: ValidationComment[]) {
    const messageProperties = this.VALIDATIONS_IN_PROGRESS[this.validationKey(user, AccountType.Forum)]
    if (!messageProperties) {
      throw new ValidationTimeoutError()
    }

    const { address, timestamp } = messageProperties

    const validationComment = getValidationComment(validationComments, address, timestamp, AccountType.Forum)

    if (validationComment) {
      await this.createConnection(AccountType.Forum, user, validationComment.userId)
      this.clearValidationInProgress(user, AccountType.Forum)
    }

    return validationComment
  }

  static async validateDiscordUser(user: string) {
    let validationComment: ValidationComment | undefined
    try {
      const messages = await DiscordService.getProfileVerificationMessages()
      const formattedMessages = messages.map<ValidationComment>((message) => ({
        id: message.id,
        userId: message.author.id,
        content: message.content,
        timestamp: message.createdTimestamp,
      }))

      validationComment = await this.checkDiscordValidationMessage(user, formattedMessages)
    } catch (error) {
      this.handleValidationError(error, user, AccountType.Discord)
    }

    if (validationComment) {
      await this.runDiscordPostLinkActions(user, validationComment)
    }

    return {
      valid: !!validationComment,
    }
  }

  private static async runDiscordPostLinkActions(user: string, validationComment: ValidationComment): Promise<void> {
    try {
      await DiscordService.deleteVerificationMessage(validationComment.id)
    } catch (error) {
      ErrorService.report('Could not delete a completed Discord verification message', {
        address: user,
        messageId: validationComment.id,
        error: `${error}`,
        category: ErrorCategory.Discord,
      })
    }

    try {
      DiscordService.sendDirectMessage(validationComment.userId, {
        title: 'Profile verification completed ✅',
        action: `You have been verified as ${user}\n\nFrom now on you will receive important notifications for you through this channel.`,
        fields: [],
      })
    } catch (error) {
      ErrorService.report('Could not enqueue the Discord verification confirmation', {
        address: user,
        discordUserId: validationComment.userId,
        error: `${error}`,
        category: ErrorCategory.Discord,
      })
    }
  }

  private static handleValidationError(
    error: unknown,
    user: string,
    account: AccountType.Forum | AccountType.Discord
  ): never {
    // Preserve deliberate client-facing failures instead of remapping them to a 500.
    if (error instanceof RequestError) {
      throw error
    }

    if (error instanceof ValidationTimeoutError) {
      throw new RequestError(error.message, 408, { code: 'validation_timeout' })
    }

    if (error instanceof IncompleteDiscourseCommentsError || error instanceof IncompleteDiscordVerificationReadError) {
      const source = account === AccountType.Forum ? 'forum' : 'Discord'
      throw new RequestError(`Could not read the complete ${source} verification history; please retry`, 503, {
        code: 'validation_source_incomplete',
      })
    }

    // A valid copy posted by another account blocks the genuine attempt without linking anything.
    if (error instanceof AmbiguousValidationError) {
      ErrorService.report('Multiple valid verification messages matched one address', {
        address: user,
        account,
        category: account === AccountType.Forum ? ErrorCategory.Discourse : ErrorCategory.Discord,
      })
      const accountName = account === AccountType.Forum ? 'forum' : 'Discord'
      throw new RequestError(`Multiple ${accountName} accounts posted the same valid verification message`, 409, {
        code: 'ambiguous_validation',
      })
    }

    ErrorService.report('Unexpected profile validation failure', {
      address: user,
      account,
      error: `${error}`,
      category: account === AccountType.Forum ? ErrorCategory.Discourse : ErrorCategory.Discord,
    })
    throw new RequestError("Couldn't validate the user", RequestError.InternalServerError)
  }

  static async checkDiscordValidationMessage(user: string, validationComments: ValidationComment[]) {
    const messageProperties = this.VALIDATIONS_IN_PROGRESS[this.validationKey(user, AccountType.Discord)]
    if (!messageProperties) {
      throw new ValidationTimeoutError()
    }
    const { address, timestamp } = messageProperties

    const validationComment = getValidationComment(validationComments, address, timestamp, AccountType.Discord)

    if (validationComment) {
      await this.createConnection(AccountType.Discord, user, validationComment.userId)
      this.clearValidationInProgress(user, AccountType.Discord)
    }

    return validationComment
  }

  // forum_id and discord_id are unique across addresses, so an account already linked elsewhere
  // reaches the insert and fails there. Answer with the reason instead of a driver error.
  private static async createConnection(
    account: AccountType.Forum | AccountType.Discord,
    address: string,
    accountId: string
  ) {
    try {
      switch (account) {
        case AccountType.Discord:
          await UserModel.createDiscordConnection(address, accountId)
          break
        case AccountType.Forum:
          await UserModel.createForumConnection(address, accountId)
          break
      }
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') {
        throw new RequestError(
          `That ${capitalize(account)} account is already linked to another address`,
          RequestError.BadRequest
        )
      }
      throw error
    }
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

  static async getProfile(address: string): Promise<UserProfile> {
    try {
      const user = await UserModel.findOne<UserAttributes>({ address: address.toLowerCase() })
      if (!user) {
        const emptyProfile: UserAttributes = { address }
        return emptyProfile
      }
      const { forum_id, forum_verification_date, discord_verification_date } = user

      return {
        address,
        forum_id,
        forum_username: forum_id ? (await DiscourseService.getUserById(forum_id))?.username : null,
        forum_verification_date,
        discord_verification_date,
      }
    } catch (error: unknown) {
      // Do not fold the stack trace into the thrown message: this runs behind the unauthenticated
      // GET /user/:address and the message is surfaced in the HTTP response body. The stack is
      // still captured in the server logs by the central error handler.
      if (error instanceof Error) {
        throw new Error(`Error while fetching profile data: ${error.message}`)
      } else {
        throw new Error(`Unexpected error while fetching profile data`)
      }
    }
  }

  static async unlinkAccount(address: string, accountType: AccountType) {
    return await UserModel.unlinkAccount(address, accountType)
  }
}
