import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { ErrorService } from '../../services/ErrorService'
import { AlchemyBlock } from '../../shared/types/events'
import { ErrorCategory } from '../../utils/errorCategories'
import { EventsService } from '../services/events'
import { validateAlchemyWebhookSignature } from '../utils/validations'

export default routes((route) => {
  route.post('/webhooks/alchemy/delegation', handleAPI(delegationUpdate))
})

async function delegationUpdate(req: Request) {
  try {
    validateAlchemyWebhookSignature(req)

    const block = req.body.event.data.block as AlchemyBlock
    if (block.logs.length === 0) {
      return
    }
    return await EventsService.delegationUpdate(block.logs)
  } catch (error) {
    ErrorService.report('Something failed on delegation update webhook', { error, category: ErrorCategory.Webhook })
  }
}
