import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { EventsService } from '../services/events'
import { validateDebugAddress, validateEventFilters, validateId, validateRequiredString } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/events', handleAPI(getLatestEvents))
  route.get('/events/all', withAuth, handleAPI(getAllEvents))
  route.post('/events/voted', withAuth, handleAPI(voted))
})

async function getLatestEvents(req: Request) {
  const filters = validateEventFilters(req)
  return await EventsService.getLatest(filters)
}

// Answers 404 for an unknown proposal and 403 when Snapshot has no vote from the caller. A 403 can be transient: it
// is also what a real voter gets if Snapshot has not indexed their vote yet. The UI ignores this call failing.
async function voted(req: WithAuth) {
  const user = req.auth!

  validateId(req.body.proposalId)
  validateRequiredString('choice', req.body.choice)
  return await EventsService.voted(req.body.proposalId, req.body.choice, user)
}

async function getAllEvents(req: WithAuth) {
  const user = req.auth!
  validateDebugAddress(user)
  return await EventsService.getAll()
}
