import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { isSameAddress } from '../../entities/Snapshot/utils'
import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from '../../entities/User/constants'
import UserModel from '../../entities/User/model'
import { AccountType, UserAttributes, ValidationComment, ValidationMessage } from '../../entities/User/types'
import {
  formatValidationMessage,
  getValidationComment,
  parseAccountTypes,
  toAccountType,
  validateComment,
} from '../../entities/User/utils'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { DiscordService } from '../services/discord'
import { validateAddress } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/user/validate', withAuth, handleAPI(getValidationMessage))
  route.post('/user/validate/forum', withAuth, handleAPI(checkForumValidationMessage))
  route.post('/user/validate/discord', withAuth, handleAPI(checkDiscordValidationMessage))
  route.get('/user/:address/is-validated', handleAPI(isValidated))
  route.get('/user/:address', handleAPI(getProfile))
})

const VALIDATIONS_IN_PROGRESS: Record<string, ValidationMessage> = {}

function clearValidationInProgress(user: string) {
  const validation = VALIDATIONS_IN_PROGRESS[user]
  if (validation) {
    clearTimeout(validation.message_timeout)
    delete VALIDATIONS_IN_PROGRESS[user]
  }
}

async function getValidationMessage(req: WithAuth) {
  const address = req.auth!
  const account = typeof req.query.account === 'string' ? req.query.account : undefined
  const message = {
    address,
    timestamp: new Date().toISOString(),
  }

  const message_timeout = setTimeout(() => {
    delete VALIDATIONS_IN_PROGRESS[address]
  }, MESSAGE_TIMEOUT_TIME)

  VALIDATIONS_IN_PROGRESS[address] = {
    ...message,
    message_timeout,
  }

  return formatValidationMessage(address, message.timestamp, toAccountType(account))
}

async function checkForumValidationMessage(req: WithAuth) {
  const user = req.auth!
  try {
    const messageProperties = VALIDATIONS_IN_PROGRESS[user]
    if (!messageProperties) {
      throw new Error('Validation timed out')
    }

    const { address, timestamp } = messageProperties

    const comments = await DiscourseService.getPostComments(Number(GATSBY_DISCOURSE_CONNECT_THREAD))
    const formattedComments = comments.comments.map((comment) => ({
      id: String(comment.user_forum_id),
      content: comment.cooked,
      timestamp: new Date(comment.created_at).getTime(),
    }))
    const validationComment = getValidationComment(formattedComments, address, timestamp)

    if (validationComment) {
      if (!isSameAddress(address, user) || !validateComment(validationComment, address, timestamp, AccountType.Forum)) {
        throw new Error('Validation failed')
      }

      await UserModel.createForumConnection(user, validationComment.id)
      clearValidationInProgress(user)
    }

    return {
      valid: !!validationComment,
    }
  } catch (error) {
    throw new Error("Couldn't validate the user. " + error)
  }
}

async function checkDiscordValidationMessage(req: WithAuth) {
  const user = req.auth!
  try {
    const messageProperties = VALIDATIONS_IN_PROGRESS[user]
    if (!messageProperties) {
      throw new Error('Validation timed out')
    }
    const { address, timestamp } = messageProperties

    const messages = await DiscordService.getProfileVerificationMessages()
    const formattedMessages = messages.map<ValidationComment>((message) => ({
      id: message.author.id,
      content: message.content,
      timestamp: message.createdTimestamp,
    }))
    const validationComment = getValidationComment(formattedMessages, address, timestamp)

    if (validationComment) {
      if (
        !isSameAddress(address, user) ||
        !validateComment(validationComment, address, timestamp, AccountType.Discord)
      ) {
        throw new Error('Validation failed')
      }

      await UserModel.createDiscordConnection(user, validationComment.id)
      clearValidationInProgress(user)
      DiscordService.sendDirectMessage(validationComment.id, {
        title: 'Profile verification completed ✅',
        action: `You have been verified as ${address}\n\nFrom now on you will receive important notifications for you through this channel.`,
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

async function isValidated(req: Request) {
  const address = validateAddress(req.params.address)
  const accounts = parseAccountTypes(req.query.account as string | string[] | undefined)
  try {
    return await UserModel.isValidated(address, new Set(accounts))
  } catch (error) {
    const message = 'Error while fetching validation data'
    ErrorService.report(message, { error })
    throw new Error(`${message}. ${error}`)
  }
}

async function getProfile(req: Request) {
  const address = validateAddress(req.params.address)
  const user = await UserModel.findOne<UserAttributes>({ address: address.toLowerCase() })

  if (!user) {
    throw new RequestError('User not found', RequestError.NotFound)
  }

  try {
    const { forum_id } = user

    return {
      forum_id,
      forum_username: forum_id ? (await DiscourseService.getUserById(forum_id))?.username : null,
    }
  } catch (error) {
    throw new Error(`Error while fetching profile data. ${error}`)
  }
}
