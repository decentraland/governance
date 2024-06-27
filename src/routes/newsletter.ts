import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'
import fetch from 'isomorphic-fetch'
import isEmail from 'validator/lib/isEmail'

import { ErrorService } from '../services/ErrorService'
import { NewsletterSubscriptionResult } from '../shared/types/newsletter'
import { ErrorCategory } from '../utils/errorCategories'

export default routes((router) => {
  router.post('/newsletter-subscribe', handleAPI(handleSubscription))
})

async function handleSubscription(req: Request): Promise<NewsletterSubscriptionResult> {
  const email = req.body.email
  if (!isEmail(email)) {
    throw new RequestError('Invalid email', RequestError.BadRequest)
  }

  const url = `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
    },
    body: `{ "email": "${email}" }`,
  })
  const data = await response.json()

  if (data.errors) {
    ErrorService.report('Error subscribing to newsletter', {
      email,
      error: JSON.stringify(data.errors),
      category: ErrorCategory.Newsletter,
    })
    return { email, error: true, details: 'Invalid email' }
  }

  return { email, error: false, details: '' }
}
