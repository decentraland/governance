import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { GATSBY_DISCOURSE_CONNECT_THREAD } from '../../entities/User/constants'
import { ValidationComment } from '../../entities/User/types'
import { validateAccountTypes } from '../../entities/User/utils'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { UserService } from '../../services/UserService'
import { DiscordService } from '../services/discord'
import { validateAddress } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/user/validate', withAuth, handleAPI(getValidationMessage))
  route.post('/user/validate/forum', withAuth, handleAPI(checkForumValidationMessage))
  route.post('/user/validate/discord', withAuth, handleAPI(checkDiscordValidationMessage))
  route.post('/user/discord-active', withAuth, handleAPI(updateDiscordStatus))
  route.get('/user/discord-active', withAuth, handleAPI(getIsDiscordActive))
  route.get('/user/:address/is-validated', handleAPI(isValidated))
  route.get('/user/:address', handleAPI(getProfile))
})

async function getValidationMessage(req: WithAuth) {
  const address = req.auth!
  const account = typeof req.query.account === 'string' ? req.query.account : undefined

  return UserService.getValidationMessage(address, account)
}

async function checkForumValidationMessage(req: WithAuth) {
  const user = req.auth!
  try {
    const comments = await DiscourseService.getPostComments(Number(GATSBY_DISCOURSE_CONNECT_THREAD))
    const formattedComments = comments.comments.map<ValidationComment>((comment) => ({
      id: '',
      userId: String(comment.user_forum_id),
      content: comment.cooked,
      timestamp: new Date(comment.created_at).getTime(),
    }))

    const validationComment = await UserService.checkForumValidationMessage(user, formattedComments)
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
    const messages = await DiscordService.getProfileVerificationMessages()
    const formattedMessages = messages.map<ValidationComment>((message) => ({
      id: message.id,
      userId: message.author.id,
      content: message.content,
      timestamp: message.createdTimestamp,
    }))

    const validationComment = await UserService.checkDiscordValidationMessage(user, formattedMessages)
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

async function updateDiscordStatus(req: WithAuth) {
  const address = req.auth!
  const { is_discord_notifications_active } = req.body
  const enabledMessage =
    'You have enabled the notifications through Discord, from now on you will receive notifications that may concern you through this channel.'
  const disabledMessage =
    'You have disabled the notifications through Discord, from now on you will no longer receive notifications through this channel.'

  try {
    if (typeof is_discord_notifications_active !== 'boolean') {
      throw new Error('Invalid discord status')
    }
    const account = await UserService.updateDiscordActiveStatus(address, is_discord_notifications_active)
    if (account) {
      if (account.is_discord_notifications_active) {
        DiscordService.sendDirectMessage(account.discord_id, {
          title: 'Notifications enabled ✅',
          action: enabledMessage,
          fields: [],
        })
      } else {
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

async function getIsDiscordActive(req: WithAuth) {
  const address = req.auth!
  try {
    return await UserService.getIsDiscordActive(address)
  } catch (error) {
    throw new Error(`Error while fetching discord status. ${error}`)
  }
}

async function isValidated(req: Request) {
  const address = validateAddress(req.params.address)
  const accounts = validateAccountTypes(req.query.account as string | string[] | undefined)
  try {
    return await UserService.isValidated(address, new Set(accounts))
  } catch (error) {
    const message = 'Error while fetching validation data'
    ErrorService.report(message, { error: `${error}` })
    throw new Error(`${message}. ${error}`)
  }
}

async function getProfile(req: Request) {
  const address = validateAddress(req.params.address)
  const user = await UserService.getProfile(address)

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
