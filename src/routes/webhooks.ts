import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { ErrorService } from '../services/ErrorService'
import { EventsService } from '../services/events'
import { AlchemyBlock } from '../shared/types/events'
import { ErrorCategory } from '../utils/errorCategories'
import { validateAlchemyWebhookSignature, validateDiscourseWebhookSignature } from '../utils/validations'

export default routes((route) => {
  route.post('/webhooks/alchemy/delegation', handleAPI(delegationUpdate))
  route.post('/webhooks/discourse/comment', handleAPI(discourseComment))
})

async function delegationUpdate(req: Request) {
  // Signature validation runs outside the try/catch so an invalid signature surfaces
  // as a 403 instead of being masked with a 200.
  validateAlchemyWebhookSignature(req)

  // The signature proves the payload came from Alchemy, not that it has the shape we expect.
  // Dereferencing blindly turns a malformed body into a 500, which Alchemy retries forever — the
  // same wedged delivery the log-level guards exist to avoid. A payload we cannot read will never
  // become readable, so report it and accept rather than asking for it again.
  const block = req.body?.event?.data?.block as AlchemyBlock | undefined
  if (!block || !Array.isArray(block.transactions)) {
    ErrorService.report('Unexpected alchemy delegation webhook payload', { category: ErrorCategory.Webhook })
    return
  }

  if (block.transactions.length === 0) {
    return
  }
  try {
    return await EventsService.delegationUpdate(block)
  } catch (error) {
    // Report, then re-throw so Alchemy sees a non-2xx and retries delivery instead of
    // silently dropping the event. delegationUpdate is idempotent (isDelegationTxRegistered).
    ErrorService.report('Something failed on delegation update webhook', { error, category: ErrorCategory.Webhook })
    throw error
  }
}

export async function discourseComment(req: Request) {
  validateDiscourseWebhookSignature(req)

  const discourseEventId = req.get('X-Discourse-Event-Id')
  const discourseEvent = req.get('X-Discourse-Event')
  if (!discourseEventId || !discourseEvent) {
    throw new RequestError('Discourse event data missing', RequestError.BadRequest)
  }
  return await EventsService.commented(discourseEventId, discourseEvent, req.body.post)
}
