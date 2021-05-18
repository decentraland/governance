import { Request } from 'express'
import routes from "decentraland-gatsby/dist/entities/Route/routes";
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle';
import { auth, WithAuth } from 'decentraland-gatsby/dist/entities/Auth/middleware';
import { getProposal } from "../Proposal/routes";
import SubscriptionModel from './model';
import { SubscriptionAttributes } from './types';

export default routes((route) => {
  const withAuth = auth()
  route.get('/subscriptions', auth({ optional: true }), handleAPI(getMySubscriptions))
  route.get('/proposals/:proposal/subscriptions', handleAPI(getProposalSubscriptions))
  route.post('/proposals/:proposal/subscriptions', withAuth, handleAPI(createProposalSubscriptions))
  route.delete('/proposals/:proposal/subscriptions', withAuth, handleAPI(removeProposalSubscriptions))
})

export async function getMySubscriptions(req: WithAuth) {
  const user = req.auth
  if (!user) {
    return []
  }

  return SubscriptionModel.find<SubscriptionAttributes>({ user })
}

export async function getProposalSubscriptions(req: Request<{ proposal: string }>) {
  const proposal = await getProposal(req)
  return SubscriptionModel.find<SubscriptionAttributes>({ proposal_id: proposal.id })
}

export async function createProposalSubscriptions(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const proposal = await getProposal(req)
  const alreadySubscribed = await SubscriptionModel.findOne<SubscriptionAttributes>({
    proposal_id: proposal.id,
    user
  })
  if (alreadySubscribed) {
    return alreadySubscribed
  }

  const subscription: SubscriptionAttributes = {
    proposal_id: proposal.id,
    user,
    created_at: new Date()
  }

  await SubscriptionModel.create(subscription)
  return subscription
}

export async function removeProposalSubscriptions(req: WithAuth<Request<{ proposal: string }>>) {
  const user = req.auth!
  const proposal = await getProposal(req)
  await SubscriptionModel.delete<SubscriptionAttributes>({
    proposal_id: proposal.id,
    user
  })

  return true
}