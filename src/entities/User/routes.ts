import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { validateAddress } from '../../back/routes/validations'
import { DiscourseService } from '../../services/DiscourseService'
import { ErrorService } from '../../services/ErrorService'
import { isSameAddress } from '../Snapshot/utils'

import { GATSBY_DISCOURSE_CONNECT_THREAD, MESSAGE_TIMEOUT_TIME } from './constants'
import UserModel from './model'
import { ValidationMessage } from './types'
import { formatValidationMessage, getValidationComment, validateComment } from './utils'

export default routes((route) => {
  const withAuth = auth()
  route.get('/user/:address/is-validated', handleAPI(isValidated))
  route.get('/user/validate', withAuth, handleAPI(getValidationMessage))
  route.post('/user/validate', withAuth, handleAPI(checkValidationMessage))
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

  return formatValidationMessage(address, message.timestamp)
}

async function checkValidationMessage(req: WithAuth) {
  const user = req.auth!
  try {
    const messageProperties = VALIDATIONS_IN_PROGRESS[user]
    if (!messageProperties) {
      throw new Error('Validation timed out')
    }

    const { address, timestamp } = messageProperties

    const comments = await DiscourseService.fetchAllComments(Number(GATSBY_DISCOURSE_CONNECT_THREAD))
    const validationComment = getValidationComment(comments, address, timestamp)

    if (validationComment) {
      if (!isSameAddress(address, user) || !validateComment(validationComment, address, timestamp)) {
        throw new Error('Validation failed')
      }

      await UserModel.createForumConnection(user, validationComment.user_id)
      clearValidationInProgress(user)
    }

    return {
      valid: !!validationComment,
    }
  } catch (error) {
    throw new Error("Couldn't validate the user. " + error)
  }
}

async function isValidated(req: Request) {
  const address = req.params.address
  validateAddress(address)
  try {
    return await UserModel.isForumValidated(address)
  } catch (error) {
    const message = 'Error while fetching validation data'
    ErrorService.report(message, { error })
    throw new Error(`${message}. ${error}`)
  }
}
