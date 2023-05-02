import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { generateHash, generateNonce } from '../../helpers'

import { DiscourseService } from './../../services/DiscourseService'

import DiscourseModel from './model'

const TIMEOUT_TIME = 5 * 60 * 1000 // 5mins
const VALIDATIONS_IN_PROGRESS: Record<string, { hash: string; hashTimeout: NodeJS.Timeout }> = {}

export default routes((route) => {
  const withAuth = auth()
  route.get('/forumId', withAuth, handleAPI(getForumId))
  route.get('/validateProfile', withAuth, handleAPI(getValidationHash))
  route.post('/validateProfile', withAuth, handleAPI(checkValidationHash))
})

function clearValidationInProgress(user: string) {
  const validation = VALIDATIONS_IN_PROGRESS[user]
  if (validation) {
    clearTimeout(validation.hashTimeout)
    delete VALIDATIONS_IN_PROGRESS[user]
  }
}

async function getValidationHash(req: WithAuth) {
  const user = req.auth!
  const hash = generateHash(`${user}#${generateNonce()}`)
  clearValidationInProgress(user)

  const hashTimeout = setTimeout(() => {
    delete VALIDATIONS_IN_PROGRESS[user]
  }, TIMEOUT_TIME)

  VALIDATIONS_IN_PROGRESS[user] = {
    hash,
    hashTimeout,
  }

  return {
    hash,
  }
}

async function checkValidationHash(req: WithAuth) {
  const user = req.auth!
  try {
    const validation = VALIDATIONS_IN_PROGRESS[user]
    if (!validation) {
      throw new Error('Validation timed out')
    }

    const { hash } = validation
    clearValidationInProgress(user)

    const comments = await DiscourseService.fetchAllComments(1190)
    const timeWindow = new Date(new Date().getTime() - TIMEOUT_TIME)

    const filteredComments = comments.filter((comment) => new Date(comment.created_at) > timeWindow)
    const regex = new RegExp(`\\b${hash}\\b`)
    const validComment = filteredComments.find((comment) => regex.test(comment.cooked))

    if (validComment) {
      await DiscourseModel.createConnection(user, validComment.user_id)
    }

    return {
      valid: !!validComment,
    }
  } catch (error) {
    throw new Error("Couldn't validate the user. Error: " + error)
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
