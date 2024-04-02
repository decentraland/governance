import { ChainId } from '@dcl/schemas/dist/dapps/chain-id'

import { PUSH_CHANNEL_ID } from '../../constants'
import { isSameAddress } from '../../entities/Snapshot/utils'
import { MESSAGE_TIMEOUT_TIME } from '../../entities/User/constants'
import UserModel from '../../entities/User/model'
import { AccountType, UserAttributes, ValidationComment, ValidationMessage } from '../../entities/User/types'
import {
  formatValidationMessage,
  getValidationComment,
  toAccountType,
  validateComment,
} from '../../entities/User/utils'
import { isProdEnv } from '../../utils/governanceEnvs'
import { getCaipAddress, getPushNotificationsEnv } from '../../utils/notifications'

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

  static async getIsDiscordActive(address: string) {
    const account = await UserModel.getDiscordIds([address])
    return account.length > 0 ? account[0].is_discord_notifications_active : false
  }

  static async isDiscordLinked(address: string) {
    return await UserModel.isValidated(address, new Set([AccountType.Discord]))
  }

  static async isValidated(address: string, accounts: Set<AccountType>): Promise<boolean> {
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
  }

  static async getProfile(address: string) {
    return await UserModel.findOne<UserAttributes>({ address: address.toLowerCase() })
  }
}
