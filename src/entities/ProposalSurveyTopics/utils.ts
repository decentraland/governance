import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import { Request } from 'express'

import ProposalModel from '../Proposal/model'
import SurveyTopicModel from '../SurveyTopic/model'

export async function getProposalSurveyTopics(req: Request<{ proposal: string }>) {
  try {
    const id = req.params.proposal
    const proposal = await ProposalModel.getProposal(id)
    return await SurveyTopicModel.getSurveyTopic(proposal)
  } catch (e: any) {
    throw new RequestError(e, RequestError.NotFound)
  }
}
