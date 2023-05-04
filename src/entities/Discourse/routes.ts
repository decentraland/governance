import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { hashMessage, recoverAddress } from 'ethers/lib/utils'

import { DiscourseService } from './../../services/DiscourseService'

import DiscourseModel from './model'
import { ValidationMessage } from './types'

const TIMEOUT_TIME = 5 * 60 * 1000 // 5mins
const VALIDATIONS_IN_PROGRESS: Record<string, ValidationMessage> = {}

export default routes((route) => {
  const withAuth = auth()
  route.get('/forumId', withAuth, handleAPI(getForumId))
  route.get('/validateProfile', withAuth, handleAPI(getValidationMessage))
  route.post('/validateProfile', withAuth, handleAPI(checkValidationMessage))
})

function clearValidationInProgress(user: string) {
  const validation = VALIDATIONS_IN_PROGRESS[user]
  if (validation) {
    clearTimeout(validation.messageTimeout)
    delete VALIDATIONS_IN_PROGRESS[user]
  }
}

async function getValidationMessage(req: WithAuth) {
  const address = req.auth!
  const message = {
    address,
    timestamp: new Date().toISOString(),
  }

  const messageTimeout = setTimeout(() => {
    delete VALIDATIONS_IN_PROGRESS[address]
  }, TIMEOUT_TIME)

  VALIDATIONS_IN_PROGRESS[address] = {
    ...message,
    messageTimeout,
  }

  return message
}

async function checkValidationMessage(req: WithAuth) {
  const user = req.auth!
  try {
    const messageProperties = VALIDATIONS_IN_PROGRESS[user]
    if (!messageProperties) {
      throw new Error('Validation timed out')
    }

    const { address, timestamp } = messageProperties
    clearValidationInProgress(user)

    const message = JSON.stringify({ address, timestamp })

    const comments = await DiscourseService.fetchAllComments(1190)
    const timeWindow = new Date(new Date().getTime() - TIMEOUT_TIME)

    const filteredComments = comments.filter((comment) => new Date(comment.created_at) > timeWindow)
    const regex = new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const validComment = filteredComments.find((comment) => regex.test(comment.cooked.replace(/(“|”)/g, '"')))

    if (validComment) {
      const signatureRegex = /0x([a-fA-F\d]{130})/
      const signature = '0x' + validComment.cooked.match(signatureRegex)?.[1]
      const recoveredAddress = recoverAddress(hashMessage(message), signature)

      if (recoveredAddress.toLowerCase() !== user) {
        throw new Error('Invalid signature')
      }

      await DiscourseModel.createConnection(user, validComment.user_id)
    }

    return {
      valid: !!validComment,
    }
  } catch (error) {
    throw new Error("Couldn't validate the user. " + error)
  }
}

async function getForumId(req: WithAuth) {
  const user = req.auth!
  try {
    const forum_id = await DiscourseModel.getForumId(user)
    return {
      forum_id,
    }
  } catch (error) {
    throw new Error("Couldn't get the forum id. Error: " + error)
  }
}
