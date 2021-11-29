import { Request } from 'express'
import routes from 'decentraland-gatsby/dist/entities/Route/routes';
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import { auth, WithAuth } from 'decentraland-gatsby/dist/entities/Auth/middleware';
import { Decentraland } from '../../api/Decentraland'
import { NewsletterSubscriptionResult } from './types'

export default routes((route) => {
  const withAuth = auth()
  route.post('/newsletter/:email', withAuth, handleAPI(subscribeToNewsletter))
})

export async function subscribeToNewsletter(req: WithAuth<Request<{email: string }>>):Promise<NewsletterSubscriptionResult> {
  try {
    await Decentraland.get().subscribe(req.params.email!)
    return {
      email: req.params.email,
      error: false,
      details: null
    }
  } catch (e) {
    return {
      email: req.params.email,
      error: true,
      details: e.body.detail
    }
  }
}
