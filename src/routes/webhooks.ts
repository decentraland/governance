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
  try {
    validateAlchemyWebhookSignature(req)
    const block = req.body.event.data.block as AlchemyBlock
    if (block.transactions.length === 0) {
      return
    }
    return await EventsService.delegationUpdate(block)
  } catch (error) {
    ErrorService.report('Something failed on delegation update webhook', { error, category: ErrorCategory.Webhook })
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
