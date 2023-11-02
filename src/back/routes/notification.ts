import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import UserModel from '../../entities/User/model'
import { NotificationCustomType } from '../../shared/types/notifications'
import { NotificationType } from '../../utils/notifications'
import UserNotificationConfigModel, { UserNotificationConfigAttributes } from '../models/UserNotificationConfig'
import { DiscordService } from '../services/discord'
import { NotificationService } from '../services/notification'
import { validateDebugAddress } from '../utils/validations'

export default routes((router) => {
  const withAuth = auth()
  router.post('/notifications/send', withAuth, handleAPI(sendNotification))
  router.get('/notifications/user/:address', handleAPI(getUserFeed))
  router.get('/notifications/last-notification', withAuth, handleAPI(getUserLastNotification))
  router.post('/notifications/last-notification', withAuth, handleAPI(updateUserLastNotification))
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

  const users = await UserModel.getDiscordIdsByAddresses([recipient])

  for (const user of users) {
    await DiscordService.sendDirectMessage(user.discord_id, {
      title: `[DEBUG] ${title}`,
      url,
      fields: [],
      action: body,
    })
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

async function getUserLastNotification(req: WithAuth) {
  const config = await UserNotificationConfigModel.findOne<UserNotificationConfigAttributes>({ address: req.auth })
  if (!config) {
    throw new RequestError('User notification not found', RequestError.NotFound)
  }

  return config.last_notification_id
}

async function updateUserLastNotification(req: WithAuth) {
  const last_notification_id = req.body.last_notification_id
  if (!last_notification_id) {
    throw new RequestError('Missing Notification ID', RequestError.BadRequest)
  }

  return await UserNotificationConfigModel.upsert({
    address: req.auth,
    last_notification_id,
  })
}
