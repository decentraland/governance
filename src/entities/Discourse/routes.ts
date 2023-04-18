import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { GOVERNANCE_API } from '../../constants'
import { encrypt, generateAsymmetricKeys } from '../../helpers'
import { DiscourseConnect } from '../../services/DiscourseConnect'

import { DiscourseConnetTokenBody } from './types'

const GOV_URL = GOVERNANCE_API.replace(/\/api/, '')

const CONNECTIONS_IN_PROGRESS: Record<string, DiscourseConnect> = {}

export default routes((route) => {
  const withAuth = auth()
  route.get('/discourseConnect', withAuth, handleAPI(getDiscourseConnectUrl))
  route.post('/discourseConnect', withAuth, handleAPI(setDiscourseConnectToken))
})
function getDiscourseConnectUrl(req: WithAuth) {
  const user = req.auth!
  const connectService = new DiscourseConnect(`${GOV_URL}/identity`)
  CONNECTIONS_IN_PROGRESS[user] = connectService

  setTimeout(() => {
    delete CONNECTIONS_IN_PROGRESS[user]
  }, 5 * 60 * 1000) // 5mins

  return {
    url: connectService.getUrl(),
  }
}

function setDiscourseConnectToken(req: WithAuth<Request<any, any, DiscourseConnetTokenBody>>) {
  const user = req.auth!
  try {
    const userApiKey = CONNECTIONS_IN_PROGRESS[user].getUserApiKey(req.body.payload)
    delete CONNECTIONS_IN_PROGRESS[user]

    const { publicKey, privateKey } = generateAsymmetricKeys()
    const encryptedApiKey = encrypt(userApiKey, publicKey)

    return {
      privateKey,
    }
  } catch (error) {
    throw new Error("Couldn't get the user API key. Error: " + error)
  }
}
