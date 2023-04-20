import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import 'isomorphic-fetch'

import { FORUM_URL, GOVERNANCE_API } from '../../constants'
import { encrypt, generateAsymmetricKeys, generateHash, generateNonce } from '../../helpers'
import { DiscourseConnect } from '../../services/DiscourseConnect'

import { DiscourseService } from './../../services/DiscourseService'

import Model from './model'
import { DiscourseConnetTokenBody, DiscourseUser } from './types'

const GOV_URL = GOVERNANCE_API.replace(/\/api/, '')

const TIMEOUT_TIME = 5 * 60 * 1000 // 5mins
const CONNECTIONS_IN_PROGRESS: Record<string, DiscourseConnect> = {}
const VALIDATIONS_IN_PROGRESS: Record<string, string> = {}

export default routes((route) => {
  const withAuth = auth()
  route.get('/discourseConnect', withAuth, handleAPI(getDiscourseConnectUrl))
  route.post('/discourseConnect', withAuth, handleAPI(setDiscourseConnectToken))
  route.get('/validateProfile', withAuth, handleAPI(getValidationHash))
  route.post('/validateProfile', withAuth, handleAPI(checkValidationHash))
})
function getDiscourseConnectUrl(req: WithAuth) {
  const user = req.auth!
  const connectService = new DiscourseConnect(`${GOV_URL}/identity`)
  CONNECTIONS_IN_PROGRESS[user] = connectService

  setTimeout(() => {
    delete CONNECTIONS_IN_PROGRESS[user]
  }, TIMEOUT_TIME)

  return {
    url: connectService.getUrl(),
  }
}

async function setDiscourseConnectToken(req: WithAuth<Request<any, any, DiscourseConnetTokenBody>>) {
  const user = req.auth!
  try {
    const userApiKey = CONNECTIONS_IN_PROGRESS[user].getUserApiKey(req.body.payload)
    delete CONNECTIONS_IN_PROGRESS[user]

    const response = await fetch(`${FORUM_URL}/session/current.json`, { headers: { ['User-Api-Key']: userApiKey } })
    const discourseUser: DiscourseUser = await response.json()

    if (!discourseUser.current_user) {
      throw new Error(discourseUser.errors?.join(', '))
    }

    const { publicKey, privateKey } = generateAsymmetricKeys()
    const encryptedApiKey = encrypt(userApiKey, publicKey)

    await Model.createConnection({
      address: user,
      forum_id: discourseUser.current_user.id,
      user_api_key_encrypted: encryptedApiKey,
    })

    return {
      privateKey,
    }
  } catch (error) {
    throw new Error("Couldn't get the user API key. Error: " + error)
  }
}

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
