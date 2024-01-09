import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { CORE_UNITS_BADGE_CID } from '../../constants'
import { storeBadgeSpec } from '../../entities/Badges/storeBadgeSpec'
import {
  ActionStatus,
  Badge,
  BadgeCreationResult,
  RevokeOrReinstateResult,
  UserBadges,
  toGovernanceBadge,
  toOtterspaceRevokeReason,
} from '../../entities/Badges/types'
import { BadgesService } from '../../services/BadgesService'
import CacheService, { TTL_24_HS } from '../../services/CacheService'
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
  router.get('/badges/core-units/', handleAPI(getCoreUnitsBadges))
  router.get('/badges/:address/', handleAPI(getBadges))
  router.post('/badges/airdrop/', withAuth, handleAPI(airdrop))
  router.post('/badges/revoke/', withAuth, handleAPI(revoke))
  router.post('/badges/upload-badge-spec/', withAuth, handleAPI(uploadBadgeSpec))
  router.post('/badges/create-badge-spec/', withAuth, handleAPI(createBadgeSpec))
})

async function getBadges(req: Request<{ address: string }>): Promise<UserBadges> {
  const address = validateAddress(req.params.address)
  return await BadgesService.getBadges(address)
}

async function getCoreUnitsBadges() {
  const cacheKey = 'core-units-badges'
  const cachedCoreUnitsBadges = CacheService.get<Record<string, Badge[]>>(cacheKey)

  if (cachedCoreUnitsBadges) {
    return cachedCoreUnitsBadges
  }

  const otterspaceBadges = await Promise.all(
    CORE_UNITS_BADGE_CID.map((badgeCid) => BadgesService.getBadgesByCid(badgeCid))
  )

  const badgesMap = otterspaceBadges.reduce((acc, rawBadges) => {
    const badges = rawBadges.map(toGovernanceBadge).filter((badge) => !badge.isPastBadge)
    return acc.set(badges[0].name, badges)
  }, new Map<string, Badge[]>())

  const result = Object.fromEntries(badgesMap.entries())
  CacheService.set(cacheKey, result, TTL_24_HS)
  return result
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
  validateDate(expiresAt, 'optional')

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

  const badgeCid = validateRequiredString('badgeCid', req.body.badgeCid)
  try {
    const result = await createSpec(badgeCid)
    return { status: ActionStatus.Success, badgeCid: JSON.stringify(result) }
  } catch (e) {
    return { status: ActionStatus.Failed, error: JSON.stringify(e) }
  }
}
