import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { EventsService } from '../services/events'
import {
  validateDebugAddress,
  validateEventTypesFilters,
  validateProposalId,
  validateRequiredString,
} from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/events', handleAPI(getLatestEvents))
  route.get('/events/all', withAuth, handleAPI(getAllEvents))
  route.post('/events/voted', withAuth, handleAPI(voted))
})

async function getLatestEvents(req: Request) {
  const eventTypes = validateEventTypesFilters(req)
  return await EventsService.getLatest(eventTypes)
}

async function voted(req: WithAuth) {
  const user = req.auth!

  validateProposalId(req.body.proposalId)
  validateRequiredString('proposalTitle', req.body.proposalTitle)
  validateRequiredString('choice', req.body.choice)
  return await EventsService.voted(req.body.proposalId, req.body.proposalTitle, req.body.choice, user)
}

async function getAllEvents(req: WithAuth) {
  const user = req.auth!
  validateDebugAddress(user)
  return await EventsService.getAll()
}
