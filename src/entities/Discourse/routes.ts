import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { generateHash, generateNonce } from '../../helpers'

import { DiscourseService } from './../../services/DiscourseService'

const TIMEOUT_TIME = 5 * 60 * 1000 // 5mins
const VALIDATIONS_IN_PROGRESS: Record<string, string> = {}

export default routes((route) => {
  const withAuth = auth()
  route.get('/validateProfile', withAuth, handleAPI(getValidationHash))
  route.post('/validateProfile', withAuth, handleAPI(checkValidationHash))
})

async function getValidationHash(req: WithAuth) {
  const user = req.auth!
  const hash = generateHash(`${user}#${generateNonce()}`)
  VALIDATIONS_IN_PROGRESS[user] = hash
  setTimeout(() => {
    delete VALIDATIONS_IN_PROGRESS[user]
  }, TIMEOUT_TIME)

  return {
    hash,
  }
}

async function checkValidationHash(req: WithAuth) {
  const user = req.auth!
  try {
    const hash = VALIDATIONS_IN_PROGRESS[user]
    if (!hash) {
      throw new Error('Validation timed out')
    }

    delete VALIDATIONS_IN_PROGRESS[user]

    const comments = await DiscourseService.fetchAllComments(1190)
    const timeWindow = new Date(new Date().getTime() - TIMEOUT_TIME)

    const filteredComments = comments.filter((comment) => new Date(comment.created_at) > timeWindow)
    const regex = new RegExp(`\\b${hash}\\b`)
    const validComment = filteredComments.find((comment) => regex.test(comment.cooked))
    return {
      valid: !!validComment,
      forum_id: validComment?.user_id,
    }
  } catch (error) {
    throw new Error("Couldn't validate the user. Error: " + error)
  }
}
