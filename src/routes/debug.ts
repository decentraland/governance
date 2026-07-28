import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { DEBUG_ADDRESSES } from '../constants'
import { giveAndRevokeLandOwnerBadges, giveTopVoterBadges, runQueuedAirdropJobs } from '../jobs/BadgeAirdrop'
import { restoreMissingUpdatesForumPost } from '../jobs/UpdatesMissingForumPost'
import CacheService from '../services/CacheService'
import { ErrorService } from '../services/ErrorService'
import { validateDebugAddress } from '../utils/validations'

const FUNCTIONS_MAP: { [key: string]: () => Promise<unknown> } = {
  runQueuedAirdropJobs,
  giveAndRevokeLandOwnerBadges,
  giveTopVoterBadges,
  restoreMissingUpdatesForumPost,
}

export default routes((router) => {
  const withAuth = auth()
  router.get(
    '/debug',
    withAuth,
    handleAPI(async (req: WithAuth) => {
      // Only debug addresses may read the debug-address list; a valid signature from any wallet
      // is not enough. Otherwise this discloses exactly which wallets hold admin powers.
      validateDebugAddress(req.auth)
      return DEBUG_ADDRESSES
    })
  )
  router.post('/debug/report-error', auth({ optional: true }), handleAPI(reportClientError))
  router.post('/debug/trigger', withAuth, handleAPI(triggerFunction))
  router.delete('/debug/invalidate-cache', withAuth, handleAPI(invalidateCache))
})

const MAX_CLIENT_ERROR_MESSAGE_LENGTH = 1000

function reportClientError(req: WithAuth): void {
  const message =
    typeof req.body?.message === 'string'
      ? req.body.message.slice(0, MAX_CLIENT_ERROR_MESSAGE_LENGTH)
      : 'Unknown client error'
  const extraInfo =
    req.body?.extraInfo && typeof req.body.extraInfo === 'object' && !Array.isArray(req.body.extraInfo)
      ? req.body.extraInfo
      : {}
  // Spread first so client-provided keys can never override the trusted `frontend` marker.
  ErrorService.report(message, { ...extraInfo, frontend: true })
}

async function triggerFunction(req: WithAuth) {
  const user = req.auth!
  validateDebugAddress(user)

  const { functionName } = req.body

  if (FUNCTIONS_MAP[functionName]) {
    try {
      const result = await FUNCTIONS_MAP[functionName]()
      return { message: `Function '${functionName}' executed successfully.`, result }
    } catch (error) {
      throw new Error(`Error executing '${functionName}' function: ${error}`)
    }
  } else {
    throw new Error(`Function '${functionName}' not found.`)
  }
}

function invalidateCache(req: WithAuth) {
  const user = req.auth!
  validateDebugAddress(user)

  const { key } = req.query
  if (!key || typeof key !== 'string') {
    throw new Error(`Invalid cache key: ${key}`)
  }

  return CacheService.remove(key)
}
