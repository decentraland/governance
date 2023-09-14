import * as PushAPI from '@pushprotocol/restapi'
import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { ethers } from 'ethers'
import { Request } from 'express'
import fetch from 'isomorphic-fetch'

import { isProdEnv } from '../../utils/governanceEnvs'
import { NotificationType, getCaipAddress } from '../../utils/notifications'
import { validateDebugAddress } from '../utils/validations'

enum ENV {
  PROD = 'prod',
  STAGING = 'staging',
}

const NotificationIdentityType = {
  DIRECT_PAYLOAD: 2,
}

const CHAIN_ID = 5
const CHANNEL_ADDRESS = '0xBf363AeDd082Ddd8DB2D6457609B03f9ee74a2F1'

export default routes((router) => {
  const withAuth = auth()
  router.post('/notifications/send', withAuth, handleAPI(sendNotification))
  router.get('/notifications/user/:address', handleAPI(getUserFeed))
})

const PUSH_CHANNEL_OWNER_PK = process.env.PUSH_CHANNEL_OWNER_PK
const PUSH_API_URL = process.env.PUSH_API_URL
const pkAddress = `0x${PUSH_CHANNEL_OWNER_PK}`
const signer = new ethers.Wallet(pkAddress)

async function sendNotification(req: WithAuth) {
  validateDebugAddress(req.auth)
  const { title, body, recipient, cta, type } = req.body

  if (type === NotificationType.TARGET && !recipient) {
    throw new RequestError('Target type needs recipient', RequestError.BadRequest)
  }

  if (!title || !body) {
    throw new RequestError('Invalid data', RequestError.BadRequest)
  }

  const response = await PushAPI.payloads.sendNotification({
    signer,
    type,
    identityType: NotificationIdentityType.DIRECT_PAYLOAD,
    notification: {
      title,
      body,
    },
    payload: {
      title,
      body,
      cta,
      img: '',
    },
    recipients: recipient ? getCaipAddress(recipient, CHAIN_ID) : undefined,
    channel: getCaipAddress(CHANNEL_ADDRESS, CHAIN_ID),
    env: isProdEnv() ? ENV.PROD : ENV.STAGING,
  })

  return response.data
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
