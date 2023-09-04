import * as PushAPI from '@pushprotocol/restapi'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { ethers } from 'ethers'
import { Request } from 'express'
import fetch from 'isomorphic-fetch'

import { isProdEnv } from '../../utils/governanceEnvs'
import { getCaipAddress } from '../../utils/notifications'

enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
}

const NotificationType = {
  TARGET: 3,
  SUBSET: 4,
  BROADCAST: 1,
}

const NotificationIdentityType = {
  DIRECT_PAYLOAD: 2,
}

const CHAIN_ID = 5
const CHANNEL_ADDRESS = '0xBf363AeDd082Ddd8DB2D6457609B03f9ee74a2F1'

export default routes((router) => {
  router.post('/notifications/send', handleAPI(handleSendNotification))
  router.get('/notifications/user/:address', handleAPI(handleUserNotifications))
})

const PUSH_CHANNEL_OWNER_PK = process.env.PUSH_CHANNEL_OWNER_PK
const PUSH_API_URL = process.env.PUSH_API_URL
const pkAddress = `0x${PUSH_CHANNEL_OWNER_PK}`
const signer = new ethers.Wallet(pkAddress)

async function handleSendNotification(req: Request) {
  const { title, body, recipient } = req.body

  if (!recipient || !title || !body) {
    throw new RequestError('Invalid data', RequestError.BadRequest)
  }

  const response = await PushAPI.payloads.sendNotification({
    signer,
    type: NotificationType.TARGET,
    identityType: NotificationIdentityType.DIRECT_PAYLOAD,
    notification: {
      title,
      body,
    },
    payload: {
      title,
      body,
      cta: '',
      img: '',
    },
    recipients: getCaipAddress(recipient, CHAIN_ID),
    channel: getCaipAddress(CHANNEL_ADDRESS, CHAIN_ID),
    env: isProdEnv() ? ENV.PROD : ENV.STAGING,
  })

  return response.data
}

async function handleUserNotifications(req: Request) {
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
