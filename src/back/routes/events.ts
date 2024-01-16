import { WithAuth, auth } from 'decentraland-gatsby/dist/entities/Auth/middleware'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { EventsService } from '../services/events'
import { validateDiscourseWebhookSignature, validateProposalId, validateRequiredString } from '../utils/validations'

export default routes((route) => {
  const withAuth = auth()
  route.get('/events', handleAPI(getLatestEvents))
  route.post('/events/voted', withAuth, handleAPI(voted))
  route.post('/events/discourse/new', handleAPI(newDiscourseEvent))
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

async function newDiscourseEvent(req: Request) {
  validateDiscourseWebhookSignature(req)

  const discourseEventId = req.get('X-Discourse-Event-Id')
  const discourseEvent = req.get('X-Discourse-Event')
  if (!discourseEventId || !discourseEvent) {
    throw new RequestError('Discourse event data missing', RequestError.BadRequest)
  }
  return await EventsService.commented(discourseEventId, discourseEvent, req.body.post)
}
