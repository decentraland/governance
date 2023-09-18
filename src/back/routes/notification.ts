import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import fetch from 'isomorphic-fetch'

import { NotificationType, getCaipAddress } from '../../utils/notifications'
import { NotificationService } from '../services/notification'
import { validateDebugAddress } from '../utils/validations'

const CHAIN_ID = 5
const CHANNEL_ADDRESS = '0xBf363AeDd082Ddd8DB2D6457609B03f9ee74a2F1'

export default routes((router) => {
  const withAuth = auth()
  router.post('/notifications/send', withAuth, handleAPI(sendNotification))
  router.get('/notifications/user/:address', handleAPI(getUserFeed))
})

const PUSH_API_URL = process.env.PUSH_API_URL

async function sendNotification(req: WithAuth) {
  validateDebugAddress(req.auth)
  const { title, body, recipient, cta, type } = req.body

  if (type === NotificationType.TARGET && !recipient) {
    throw new RequestError('Target type needs recipient', RequestError.BadRequest)
  }

  if (!title || !body) {
    throw new RequestError('Invalid data', RequestError.BadRequest)
  }

  return await NotificationService.sendNotification(type, title, body, recipient, cta)
}

async function getUserFeed(req: Request) {
  const address = req.params.address
  if (!address) {
    throw new RequestError('Missing user', RequestError.BadRequest)
  }

  const response = await fetch(
    `${PUSH_API_URL}/apis/v1/users/${getCaipAddress(address, CHAIN_ID)}/channels/${getCaipAddress(
      CHANNEL_ADDRESS,
      CHAIN_ID
    )}/feeds`
  )

  return (await response.json()).feeds
}
