import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { SurveyTopicsService } from '../../services/SurveyTopicsService'

export default routes((route) => {
  route.get('/proposals/:proposal/survey-topics', handleAPI(getProposalSurveyTopics))
})

async function getProposalSurveyTopics(req: Request<{ proposal: string }>) {
  try {
    const id = req.params.proposal
    if (!id || id.length < 1) return []
    return SurveyTopicsService.getProposalSurveyTopics(id)
  } catch (e: any) {
    throw new RequestError(e, RequestError.NotFound)
  }
}
