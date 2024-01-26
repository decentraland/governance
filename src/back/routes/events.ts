import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { EventsService } from '../services/events'
import { validateProposalId, validateRequiredString } from '../utils/validations'

import { discourseComment } from './webhooks'

export default routes((route) => {
  const withAuth = auth()
  route.get('/events', handleAPI(getLatestEvents))
  route.post('/events/voted', withAuth, handleAPI(voted))
  route.post('/events/discourse/new', handleAPI(discourseComment)) //TODO: deprecate
})

async function getLatestEvents() {
  return await EventsService.getLatest()
}

async function voted(req: WithAuth) {
  const user = req.auth!

  validateProposalId(req.body.proposalId)
  validateRequiredString('proposalTitle', req.body.proposalTitle)
  validateRequiredString('choice', req.body.choice)
  return await EventsService.voted(req.body.proposalId, req.body.proposalTitle, req.body.choice, user)
}
