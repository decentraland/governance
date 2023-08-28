import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { ActionStatus, UploadResult, UserBadges, toOtterspaceRevokeReason } from '../../entities/Badges/types'
import { mintBadge, storeBadgeSpec } from '../../entities/Badges/utils'
import isDebugAddress from '../../entities/Debug/isDebugAddress'
import { BadgesService } from '../../services/BadgesService'
import { AirdropOutcome } from '../models/AirdropJob'
import { validateAddress, validateDate, validateRequiredString, validateRequiredStrings } from '../utils/validations'

export default routes((router) => {
  const withAuth = auth()
  router.get('/badges/:address/', handleAPI(getBadges))
  router.post('/badges/airdrop/', withAuth, handleAPI(airdrop))
  router.post('/badges/revoke/', withAuth, handleAPI(revoke))
  router.post('/badges/upload/', withAuth, handleAPI(upload))
  router.post('/badges/mint/', withAuth, handleAPI(mint))
})

async function getBadges(req: Request<{ address: string }>): Promise<UserBadges> {
  const address = req.params.address
  validateAddress(address)
  return await BadgesService.getBadges(address)
}

async function airdrop(req: WithAuth): Promise<AirdropOutcome> {
  const user = req.auth!
  const recipients: string[] = req.body.recipients
  const badgeSpecCid = req.body.badgeSpecCid

  if (!isDebugAddress(user)) {
    throw new RequestError('Invalid user', RequestError.Unauthorized)
  }

  recipients.map((address) => {
    validateAddress(address)
  })

  if (!badgeSpecCid || badgeSpecCid.length === 0) {
    throw new RequestError('Invalid Badge Spec Cid', RequestError.BadRequest)
  }

  return await BadgesService.giveBadgeToUsers(badgeSpecCid, recipients)
}

async function revoke(req: WithAuth): Promise<string> {
  const user = req.auth!
  const { badgeSpecCid, reason } = req.body
  const recipients: string[] = req.body.recipients

  if (!isDebugAddress(user)) {
    throw new RequestError('Invalid user', RequestError.Unauthorized)
  }

  recipients.map((address) => {
    validateAddress(address)
  })

  if (!badgeSpecCid || badgeSpecCid.length === 0) {
    throw new RequestError('Invalid Badge Spec Cid', RequestError.BadRequest)
  }

  const validatedReason = reason
    ? toOtterspaceRevokeReason(reason, (reason) => {
        throw new RequestError(`Invalid revoke reason ${reason}`, RequestError.BadRequest)
      })
    : undefined
  try {
    const revocationResults = await BadgesService.revokeBadge(badgeSpecCid, recipients, validatedReason)
    return `Revocation results: ${JSON.stringify(revocationResults)}`
  } catch (e) {
    return `Failed to revoke badges ${JSON.stringify(e)}`
  }
}

async function upload(req: WithAuth): Promise<UploadResult> {
  const user = req.auth
  if (!isDebugAddress(user)) {
    throw new RequestError('Invalid user', RequestError.Unauthorized)
  }

  const { title, description, imgUrl, expiresAt } = req.body
  validateRequiredStrings(['title', 'description', 'imgUrl'], req.body)
  validateDate(expiresAt)

  try {
    const result = await storeBadgeSpec(title, description, imgUrl, expiresAt)
    return { status: ActionStatus.Success, ...result }
  } catch (e) {
    console.log('e', e)
    return { status: ActionStatus.Failed, badgeCid: JSON.stringify(e) }
  }
}

async function mint(req: WithAuth): Promise<UploadResult> {
  const user = req.auth
  if (!isDebugAddress(user)) {
    throw new RequestError('Invalid user', RequestError.Unauthorized)
  }

  const { badgeCid } = req.body
  validateRequiredString('badgeCid', badgeCid)

  try {
    const result = await mintBadge(badgeCid)
    return { status: ActionStatus.Success, badgeCid: JSON.stringify(result) }
  } catch (e) {
    console.log('e', e)
    return { status: ActionStatus.Failed, badgeCid: JSON.stringify(e) }
  }
}
