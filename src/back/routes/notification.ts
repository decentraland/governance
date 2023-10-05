import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { NotificationCustomType } from '../../shared/types/notifications'
import { NotificationType } from '../../utils/notifications'
import { NotificationService } from '../services/notification'
import { validateDebugAddress } from '../utils/validations'

export default routes((router) => {
  const withAuth = auth()
  router.post('/notifications/send', withAuth, handleAPI(sendNotification))
  router.get('/notifications/user/:address', handleAPI(getUserFeed))
})

async function sendNotification(req: WithAuth) {
  validateDebugAddress(req.auth)
  const { title, body, recipient, url, type } = req.body

  if (type === NotificationType.TARGET && !recipient) {
    throw new RequestError('Target type needs recipient', RequestError.BadRequest)
  }

  if (!title || !body) {
    throw new RequestError('Invalid data', RequestError.BadRequest)
  }

  return await NotificationService.sendNotification({
    type,
    title,
    body,
    recipient,
    url,
    customType: NotificationCustomType.Announcement,
  })
}

async function getUserFeed(req: Request) {
  const address = req.params.address
  if (!address) {
    throw new RequestError('Missing user', RequestError.BadRequest)
  }

  return await NotificationService.getUserFeed(address)
}
