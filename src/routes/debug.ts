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
    handleAPI(async () => DEBUG_ADDRESSES)
  )
  router.post('/debug/report-error', auth({ optional: true }), handleAPI(reportClientError))
  router.post('/debug/trigger', withAuth, handleAPI(triggerFunction))
  router.delete('/debug/invalidate-cache', withAuth, handleAPI(invalidateCache))
})

function reportClientError(req: WithAuth): void {
  ErrorService.report(req.body.message, { frontend: true, ...req.body.extraInfo })
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
