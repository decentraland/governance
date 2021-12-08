import { Request } from 'express'
import routes from 'decentraland-gatsby/dist/entities/Route/routes';
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import { Decentraland } from '../../api/Decentraland'
import { NewsletterSubscriptionResult } from './types'

export default routes((route) => {
  route.post('/newsletter/:email', handleAPI(subscribeToNewsletter))
})

export async function subscribeToNewsletter(req: Request<{email: string }>):Promise<NewsletterSubscriptionResult> {
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
