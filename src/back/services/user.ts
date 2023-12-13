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
import { createDefaultCatalystProfile, getProfiles } from '../../utils/Catalyst'
import { CatalystProfileStatus } from '../../utils/Catalyst/types'

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
    const account = await UserModel.getDiscordIdsByAddresses([address], false)
    return account.length > 0 ? account[0] : null
  }

  static async getIsDiscordActive(address: string) {
    const account = await UserModel.getDiscordIdsByAddresses([address], false)
    return account.length > 0 ? account[0].is_discord_notifications_active : false
  }

  static async isValidated(address: string, accounts: Set<AccountType>): Promise<boolean> {
    return await UserModel.isValidated(address, accounts)
  }

  static async getProfile(address: string) {
    return await UserModel.findOne<UserAttributes>({ address: address.toLowerCase() })
  }

  //TODO: move somewhere it can be reused by getProfiles hook
  //TODO: make this return the avatar and the default username
  static async getCatalystProfileStatus(addresses: string[]) {
    let addressesProfiles: CatalystProfileStatus[] = []
    try {
      const profiles = await getProfiles(addresses)
      addressesProfiles = profiles.map<CatalystProfileStatus>((profile, idx) => ({
        profile: profile || createDefaultCatalystProfile(addresses[idx]),
        isDefaultProfile: !profile,
      }))
    } catch (error) {
      console.error(error) //TODO: is it necessary to report to error service?
      addressesProfiles = addresses.map<CatalystProfileStatus>((address) => ({
        profile: createDefaultCatalystProfile(address),
        isDefaultProfile: true,
      }))
    }

    return addressesProfiles
  }
}
