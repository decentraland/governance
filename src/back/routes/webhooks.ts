import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { AlchemyBlock } from '../../shared/types/events'
import { EventsService } from '../services/events'
import { validateAlchemyWebhookSignature } from '../utils/validations'

export default routes((route) => {
  route.post('/webhooks/delegation-update', handleAPI(delegationUpdate))
})

async function delegationUpdate(req: Request) {
  validateAlchemyWebhookSignature(req)

  const block = req.body.event.data.block as AlchemyBlock
  return await EventsService.delegationUpdate(block)
}
