import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { storeBadgeSpec } from '../../entities/Badges/storeBadgeSpec'
import {
  ActionStatus,
  BadgeCreationResult,
  RevokeOrReinstateResult,
  UserBadges,
  toOtterspaceRevokeReason,
} from '../../entities/Badges/types'
import { BadgesService } from '../../services/BadgesService'
import { AirdropOutcome } from '../types/AirdropJob'
import { createSpec } from '../utils/contractInteractions'
import {
  validateAddress,
  validateDate,
  validateDebugAddress,
  validateRequiredString,
  validateRequiredStrings,
} from '../utils/validations'

export default routes((router) => {
  const withAuth = auth()
  router.get('/badges/:address/', handleAPI(getBadges))
  router.post('/badges/airdrop/', withAuth, handleAPI(airdrop))
  router.post('/badges/revoke/', withAuth, handleAPI(revoke))
  router.post('/badges/upload-badge-spec/', withAuth, handleAPI(uploadBadgeSpec))
  router.post('/badges/create-badge-spec/', withAuth, handleAPI(createBadgeSpec))
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

  validateDebugAddress(user)

  recipients.map((address) => {
    validateAddress(address)
  })

  if (!badgeSpecCid || badgeSpecCid.length === 0) {
    throw new RequestError('Invalid Badge Spec Cid', RequestError.BadRequest)
  }

  return await BadgesService.giveBadgeToUsers(badgeSpecCid, recipients)
}

async function revoke(req: WithAuth): Promise<RevokeOrReinstateResult[]> {
  const user = req.auth!
  const { badgeSpecCid, reason } = req.body
  const recipients: string[] = req.body.recipients

  validateDebugAddress(user)

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
  return await BadgesService.revokeBadge(badgeSpecCid, recipients, validatedReason)
}

async function uploadBadgeSpec(req: WithAuth): Promise<BadgeCreationResult> {
  const user = req.auth
  validateDebugAddress(user)

  const { title, description, imgUrl, expiresAt } = req.body
  validateRequiredStrings(['title', 'description', 'imgUrl'], req.body)
  validateDate(expiresAt)

  try {
    const result = await storeBadgeSpec({
      title,
      description,
      imgUrl,
      expiresAt,
    })
    return { status: ActionStatus.Success, badgeCid: result.badgeCid }
  } catch (e) {
    return { status: ActionStatus.Failed, error: JSON.stringify(e) }
  }
}

async function createBadgeSpec(req: WithAuth): Promise<BadgeCreationResult> {
  const user = req.auth
  validateDebugAddress(user)

  const { badgeCid } = req.body
  validateRequiredString('badgeCid', badgeCid)

  try {
    const result = await createSpec(badgeCid)
    return { status: ActionStatus.Success, badgeCid: JSON.stringify(result) }
  } catch (e) {
    return { status: ActionStatus.Failed, error: JSON.stringify(e) }
  }
}
